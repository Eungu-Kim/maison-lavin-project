public with sharing class Customer360SnapshotController {

    public class Customer360DTO {
        @AuraEnabled public Id id;

        // Purchase / Order (Opportunity 기반)
        @AuraEnabled public Decimal totalOrderCount;
        @AuraEnabled public Decimal totalPurchaseAmount;
        @AuraEnabled public Date lastPurchaseDate;
        @AuraEnabled public Decimal lastOrderAmount;
        @AuraEnabled public Decimal avgOrderValue;

        // Case
        @AuraEnabled public Decimal openCaseCount;
        @AuraEnabled public Decimal totalCaseCount;
        @AuraEnabled public Date lastCaseDate;
        @AuraEnabled public String lastCaseStatus;
        @AuraEnabled public String lastCaseType;

        // Interaction
        @AuraEnabled public Date lastInteractionDate;
        @AuraEnabled public String lastInteractionChannel;
        @AuraEnabled public String preferredChannel;
        @AuraEnabled public String lastInteractionSummary;

        // Status
        @AuraEnabled public String customerTier;
        @AuraEnabled public String customerStatus;
        @AuraEnabled public String churnRisk;
    }

    @AuraEnabled(cacheable=true)
    public static Customer360DTO getCustomer360ByAccount(Id accountId) {
        if (accountId == null) return null;

        List<Customer_360__c> rows = [
            SELECT Id,
                   Total_Order_Count__c,
                   Total_Purchase_Amount__c,
                   Last_Purchase_Date__c,
                   Last_Order_Amount__c,
                   Avg_Order_Value__c,
                   Open_Case_Count__c,
                   Total_Case_Count__c,
                   Last_Case_Date__c,
                   Last_Case_Status__c,
                   Last_Case_Type__c,
                   Last_Interaction_Date__c,
                   Last_Interaction_Channel__c,
                   Preferred_Channel__c,
                   Last_Interaction_Summary__c,
                   Customer_Tier__c,
                   Customer_Status__c,
                   Churn_Risk__c
            FROM Customer_360__c
            WHERE Account__c = :accountId
            ORDER BY LastModifiedDate DESC
            LIMIT 1
        ];

        if (rows.isEmpty()) return null;

        Customer_360__c c = rows[0];
        Customer360DTO dto = new Customer360DTO();

        dto.id = c.Id;

        // Purchase
        dto.totalOrderCount = c.Total_Order_Count__c;
        dto.totalPurchaseAmount = c.Total_Purchase_Amount__c;
        dto.lastPurchaseDate = c.Last_Purchase_Date__c;
        dto.lastOrderAmount = c.Last_Order_Amount__c;
        dto.avgOrderValue = c.Avg_Order_Value__c;

        // Case
        dto.openCaseCount = c.Open_Case_Count__c;
        dto.totalCaseCount = c.Total_Case_Count__c;
        dto.lastCaseDate = c.Last_Case_Date__c;
        dto.lastCaseStatus = c.Last_Case_Status__c;
        dto.lastCaseType = c.Last_Case_Type__c;

        // Interaction
        dto.lastInteractionDate = c.Last_Interaction_Date__c;
        dto.lastInteractionChannel = c.Last_Interaction_Channel__c;
        dto.preferredChannel = c.Preferred_Channel__c;
        dto.lastInteractionSummary = c.Last_Interaction_Summary__c;

        // Status
        dto.customerTier = c.Customer_Tier__c;
        dto.customerStatus = c.Customer_Status__c;
        dto.churnRisk = c.Churn_Risk__c;

        return dto;
    }
}
