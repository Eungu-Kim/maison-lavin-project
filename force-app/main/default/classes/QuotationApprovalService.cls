public without sharing class QuotationApprovalService {

    public class OppDTO {
        @AuraEnabled public Id id;
        @AuraEnabled public String name;
        @AuraEnabled public String stageName;
        @AuraEnabled public String orderNumber;
        @AuraEnabled public String pdfUrl;
    }

    @AuraEnabled(cacheable=true)
    public static OppDTO getOpportunityForApproval(Id oppId) {
        if (oppId == null) {
            throw new AuraHandledException('oppId가 없습니다.');
        }

        Opportunity opp = [
            SELECT Id, Name, StageName, OrderNumber__c,
                   Quotation_PDF_URL__c,
                   Quotation_PDF__c,
                   Quotation_Login_URL__c
            FROM Opportunity
            WHERE Id = :oppId
            LIMIT 1
        ];

        OppDTO dto = new OppDTO();
        dto.id = opp.Id;
        dto.name = opp.Name;
        dto.stageName = opp.StageName;
        dto.orderNumber = opp.OrderNumber__c;

        if (!String.isBlank(opp.Quotation_PDF_URL__c)) {
            dto.pdfUrl = opp.Quotation_PDF_URL__c;
        } else if (!String.isBlank(opp.Quotation_PDF__c)) {
            dto.pdfUrl = opp.Quotation_PDF__c;
        } else if (!String.isBlank(opp.Quotation_Login_URL__c)) {
            dto.pdfUrl = opp.Quotation_Login_URL__c;
        } else {
            dto.pdfUrl = null;
        }

        return dto;
    }

    // ✅ (추가) LostReason__c 픽리스트 값 가져오기 (Org 값 그대로)
    @AuraEnabled(cacheable=true)
    public static List<String> getLostReasonPicklistValues() {
        List<String> values = new List<String>();

        Schema.DescribeFieldResult d =
            Opportunity.LostReason__c.getDescribe();

        for (Schema.PicklistEntry pe : d.getPicklistValues()) {
            if (pe.isActive()) {
                values.add(pe.getLabel()); // ✅ 화면 표시값(한글)
            }
        }
        return values;
    }

    @AuraEnabled
    public static void approveQuotation(Id oppId) {
        if (oppId == null) throw new AuraHandledException('oppId가 없습니다.');

        Opportunity opp = new Opportunity(
            Id = oppId,
            StageName = '견적승인'
        );
        update opp;
    }

    @AuraEnabled
    public static void rejectQuotation(Id oppId, String reason) {
        if (oppId == null) throw new AuraHandledException('oppId가 없습니다.');
        if (String.isBlank(reason)) throw new AuraHandledException('반려 사유를 입력해주세요.');

        Opportunity opp = new Opportunity(
            Id = oppId,
            LostReason__c = reason,
            StageName = 'Closed'
        );
        update opp;
    }
}