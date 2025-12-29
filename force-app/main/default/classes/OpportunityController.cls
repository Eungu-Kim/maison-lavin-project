public with sharing class OpportunityController {
    @AuraEnabled
    public static void takeOrder(Id oppId) {
        Opportunity opp = [SELECT Id, StageName FROM Opportunity WHERE Id = :oppId LIMIT 1];
        
        // 담당자 필드에만 현재 사용자 이름 입력
        User currentUser = [SELECT Name FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        opp.Assigned_Queue__c = currentUser.Name;
        
        // 단계만 변경
        opp.StageName = '견적논의';
        
        update opp;
    }
}