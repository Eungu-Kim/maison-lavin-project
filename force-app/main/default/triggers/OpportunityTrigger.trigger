trigger OpportunityTrigger on Opportunity (after insert, after update) {

    Set<Id> accountIds = new Set<Id>();

    for (Opportunity opp : Trigger.new) {
        if (opp.AccountId == null) continue;

        if (Trigger.isInsert) {
            // 새로 생성된 기회가 픽업 완료면 집계
            if (opp.StageName == '픽업 완료') {
                accountIds.add(opp.AccountId);
            }
        }

        if (Trigger.isUpdate) {
            Opportunity oldOpp = Trigger.oldMap.get(opp.Id);

            Boolean stageBecamePickup =
                oldOpp.StageName != '픽업 완료' &&
                opp.StageName == '픽업 완료';

            Boolean pickupChanged =
                opp.StageName == '픽업 완료' &&
                (
                    opp.Amount != oldOpp.Amount ||
                    opp.CloseDate != oldOpp.CloseDate ||
                    opp.AccountId != oldOpp.AccountId
                );

            if (stageBecamePickup || pickupChanged) {
                accountIds.add(opp.AccountId);
            }
        }
    }

    if (!accountIds.isEmpty()) {
        Customer360AggregationService.recalcForAccounts(accountIds);
    }
}
