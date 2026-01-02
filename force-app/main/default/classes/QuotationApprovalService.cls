public without sharing class QuotationApprovalService {

    public class OppDTO {
        @AuraEnabled public Id id;
        @AuraEnabled public String name;
        @AuraEnabled public String stageName;
        @AuraEnabled public String orderNumber;
    }

    @AuraEnabled(cacheable=true)
    public static OppDTO getOpportunityForApproval(Id oppId) {
        if (oppId == null) {
            throw new AuraHandledException('oppId가 없습니다.');
        }

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

    @AuraEnabled(cacheable=true)
    public static List<String> getLostReasonPicklistValues() {
        List<String> values = new List<String>();

        Schema.DescribeFieldResult d = Opportunity.LostReason__c.getDescribe();
        for (Schema.PicklistEntry pe : d.getPicklistValues()) {
            if (pe.isActive()) {
                values.add(pe.getLabel());
            }
        }
        return values;
    }

    @AuraEnabled
    public static void approveQuotation(Id oppId) {
        if (oppId == null) throw new AuraHandledException('oppId가 없습니다.');

        update new Opportunity(
            Id = oppId,
            StageName = '견적승인'
        );
    }

    @AuraEnabled
    public static void rejectQuotation(Id oppId, String reason) {
        if (oppId == null) throw new AuraHandledException('oppId가 없습니다.');
        if (String.isBlank(reason)) throw new AuraHandledException('반려 사유를 선택해주세요.');

        update new Opportunity(
            Id = oppId,
            LostReason__c = reason,
            StageName = 'Closed'
        );
    }
}