public without sharing class QuotationApprovalService {

    public class OppDTO {
        @AuraEnabled public Id id;
        @AuraEnabled public String name;
        @AuraEnabled public String stageName;
        @AuraEnabled public String orderNumber;
        // pdfUrl 필드 제거함 (하드코딩 사용)
    }

    @AuraEnabled(cacheable=true)
    public static OppDTO getOpportunityForApproval(Id oppId) {
        if (oppId == null) throw new AuraHandledException('oppId가 없습니다.');

        Opportunity opp = [
            SELECT Id, Name, StageName, OrderNumber__c
            FROM Opportunity 
            WHERE Id = :oppId 
            LIMIT 1
        ];

        OppDTO dto = new OppDTO();
        dto.id = opp.Id;
        dto.name = opp.Name;
        dto.stageName = opp.StageName;
        dto.orderNumber = opp.OrderNumber__c;

        return dto;
    }

    // 반려 사유 Picklist 조회
    @AuraEnabled(cacheable=true)
    public static List<String> getLostReasonPicklistValues() {
        List<String> values = new List<String>();
        Schema.DescribeFieldResult d = Opportunity.LostReason__c.getDescribe();
        for (Schema.PicklistEntry pe : d.getPicklistValues()) {
            if (pe.isActive()) values.add(pe.getLabel());
        }
        return values;
    }

    @AuraEnabled
    public static void approveQuotation(Id oppId) {
        update new Opportunity(Id = oppId, StageName = '견적승인');
    }

    @AuraEnabled
    public static void rejectQuotation(Id oppId, String reason) {
        update new Opportunity(Id = oppId, LostReason__c = reason, StageName = 'Closed');
    }
}