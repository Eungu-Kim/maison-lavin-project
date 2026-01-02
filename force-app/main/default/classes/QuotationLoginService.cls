public without sharing class QuotationLoginService {

    @AuraEnabled(cacheable=false)
    public static String loginAndGetLatestOpportunityId(String email) {
        if (String.isBlank(email)) {
            throw new AuraHandledException('이메일을 입력해주세요.');
        }

        String normalized = email.trim().toLowerCase();

        List<Opportunity> oppList = [
            SELECT Id,
                   AccountId,
                   Account.Custom_Email__c,
                   PartnerAccountId,
                   PartnerAccount.Custom_Email__c,
                   Quotation_Login_URL__c,
                   Quotation_PDF_URL__c,
                   Quotation_PDF__c
            FROM Opportunity
            WHERE (
                Account.Custom_Email__c = :normalized
                OR PartnerAccount.Custom_Email__c = :normalized
            )
            AND (
                Quotation_Login_URL__c != null
                OR Quotation_PDF_URL__c != null
                OR Quotation_PDF__c != null
            )
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];

        if (oppList.isEmpty()) {
            throw new AuraHandledException(
                '견적서가 생성된 주문(Opportunity)을 찾지 못했습니다.'
            );
        }

        return oppList[0].Id;
    }
}