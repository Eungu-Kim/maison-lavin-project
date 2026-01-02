public with sharing class ExperienceLeadController {

    @AuraEnabled
    public static Id createLead(
        String firstName,
        String lastName,
        String salutation,
        String phone,
        String email,
        String shippingFullAddress,
        String cityDistrict,
        Boolean telephoneOptIn,
        Boolean emailOptIn,
        Boolean smsOptIn,
        Boolean consentDataUsage
    ) {
        if (String.isBlank(lastName)) {
            throw new AuraHandledException('성을 입력해주세요.');
        }

        Lead l = new Lead();
        l.LastName = lastName.trim();
        l.FirstName = String.isBlank(firstName) ? null : firstName.trim();

        // Salutation(표준 Picklist) 저장
        l.Salutation = String.isBlank(salutation) ? null : salutation.trim();

        String cleanedPhone = null;
        if (!String.isBlank(phone)) {
            cleanedPhone = phone.trim().replaceAll('[^0-9+]', '');
        }

        // 1) 표준 Phone
        if (!String.isBlank(cleanedPhone)) {
            l.Phone = cleanedPhone;
        }

        // 2) MobilePhone이 있는 org면 같이 넣기 (레이아웃이 Mobile만 표시할 때 대비)
        if (!String.isBlank(cleanedPhone)) {
            Map<String, Schema.SObjectField> fMap = Schema.SObjectType.Lead.fields.getMap();
            if (fMap.containsKey('MobilePhone')) {
                l.put('MobilePhone', cleanedPhone);
            }
        }

        // 3) 레이아웃에서 보이는 '연락처'가 커스텀 필드인 경우 대비 (존재하는 첫 후보에 저장)
        if (!String.isBlank(cleanedPhone)) {
            Map<String, Schema.SObjectField> fMap = Schema.SObjectType.Lead.fields.getMap();

            List<String> candidates = new List<String>{
                'Contact__c',
                'Contact_Phone__c',
                'Customer_Phone__c',
                'Phone_Number__c'
            };

            for (String apiName : candidates) {
                if (fMap.containsKey(apiName)) {
                    l.put(apiName, cleanedPhone);
                    break;
                }
            }
        }

        l.Email = String.isBlank(email) ? null : email.trim();

        if (Schema.SObjectType.Lead.fields.getMap().containsKey('Company')) {
            l.Company = 'Individual';
        }

        l.Shipping_Full_Address__c = String.isBlank(shippingFullAddress)
            ? null : shippingFullAddress.trim();
        l.City_District__c = String.isBlank(cityDistrict)
            ? null : cityDistrict.trim();

        // 동의 필드 매핑
        l.Telephone_Opt_In__c = telephoneOptIn == true;
        l.Email_Opt_In__c = emailOptIn == true;
        l.SMS_Opt_In__c = smsOptIn == true;
        l.Consent_Data_Usage__c = consentDataUsage == true;

        try {
            insert l;
            return l.Id;
        } catch (DmlException e) {
            throw new AuraHandledException(e.getDmlMessage(0));
        }
    }

    private static String getLeadStatusValueByLabel(String targetLabel) {
        Schema.DescribeFieldResult d = Lead.Status.getDescribe();

        // 1) 라벨이 정확히 일치하고 활성인 값 반환
        for (Schema.PicklistEntry pe : d.getPicklistValues()) {
            if (pe.isActive() && pe.getLabel() == targetLabel) {
                return pe.getValue();
            }
        }

        // 2) 못 찾으면 default value로 fallback
        for (Schema.PicklistEntry pe : d.getPicklistValues()) {
            if (pe.isActive() && pe.isDefaultValue()) {
                return pe.getValue();
            }
        }

        // 3) 그래도 없으면 첫번째 active
        for (Schema.PicklistEntry pe : d.getPicklistValues()) {
            if (pe.isActive()) return pe.getValue();
        }

        // 4) 진짜로 없으면 에러
        throw new AuraHandledException('리드 상태(Lead Status) 설정을 확인해주세요. (활성 상태 값이 없습니다)');
    }
}