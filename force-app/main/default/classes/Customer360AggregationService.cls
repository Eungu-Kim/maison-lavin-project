public with sharing class Customer360AggregationService {

    public static void recalcForAccounts(Set<Id> accountIds) {
        if (accountIds == null || accountIds.isEmpty()) return;

        // =========================
        // 1) Customer_360__c 확보 (없으면 생성)
        // =========================
        Map<Id, Customer_360__c> c360Map = new Map<Id, Customer_360__c>();

        for (Customer_360__c c : [
            SELECT Id, Account__c
            FROM Customer_360__c
            WHERE Account__c IN :accountIds
        ]) {
            if (c.Account__c != null) c360Map.put(c.Account__c, c);
        }

        List<Customer_360__c> toInsert = new List<Customer_360__c>();
        for (Id accId : accountIds) {
            if (accId == null) continue;
            if (!c360Map.containsKey(accId)) {
                Customer_360__c c = new Customer_360__c(Account__c = accId);
                toInsert.add(c);
                c360Map.put(accId, c);
            }
        }
        if (!toInsert.isEmpty()) insert toInsert;

        // =========================
        // 2) 구매 집계 (Opportunity, 픽업 완료)
        // =========================
        Map<Id, Integer> orderCntMap = new Map<Id, Integer>();
        Map<Id, Decimal> totalAmtMap = new Map<Id, Decimal>();
        Map<Id, Date> lastDateMap = new Map<Id, Date>();

        for (AggregateResult ar : [
            SELECT AccountId accId,
                   COUNT(Id) cnt,
                   SUM(Amount) sumAmt,
                   MAX(CloseDate) lastDate
            FROM Opportunity
            WHERE AccountId IN :accountIds
              AND StageName = '픽업 완료'
            GROUP BY AccountId
        ]) {
            Id accId = (Id) ar.get('accId');
            if (accId == null) continue;

            Integer cnt = (Integer) ar.get('cnt');
            Decimal sumAmt = (Decimal) ar.get('sumAmt');
            Date lastDate = (Date) ar.get('lastDate');

            orderCntMap.put(accId, cnt == null ? 0 : cnt);
            totalAmtMap.put(accId, sumAmt == null ? 0 : sumAmt);
            lastDateMap.put(accId, lastDate);
        }

        // 최근 주문 금액 (가장 최근 CloseDate 1건)
        Map<Id, Decimal> lastOrderAmountMap = new Map<Id, Decimal>();
        for (Opportunity opp : [
            SELECT AccountId, Amount, CloseDate
            FROM Opportunity
            WHERE AccountId IN :accountIds
              AND StageName = '픽업 완료'
            ORDER BY CloseDate DESC, LastModifiedDate DESC
        ]) {
            if (opp.AccountId == null) continue;
            if (!lastOrderAmountMap.containsKey(opp.AccountId)) {
                lastOrderAmountMap.put(opp.AccountId, opp.Amount == null ? 0 : opp.Amount);
            }
        }

        // =========================
        // 3) 문의 집계 (Case)
        // =========================
        // 누적 문의 수 + 최근 문의일(생성일 기준)
        Map<Id, Integer> totalCaseMap = new Map<Id, Integer>();
        Map<Id, Date> lastCaseDateMap = new Map<Id, Date>();

        for (AggregateResult ar : [
            SELECT AccountId accId,
                   COUNT(Id) cnt,
                   MAX(CreatedDate) lastDt
            FROM Case
            WHERE AccountId IN :accountIds
            GROUP BY AccountId
        ]) {
            Id accId = (Id) ar.get('accId');
            if (accId == null) continue;

            Integer cnt = (Integer) ar.get('cnt');
            Datetime lastDt = (Datetime) ar.get('lastDt');

            totalCaseMap.put(accId, cnt == null ? 0 : cnt);
            lastCaseDateMap.put(accId, lastDt == null ? null : lastDt.date());
        }

        // 진행 중 문의 수 (표준: IsClosed = false)
        Map<Id, Integer> openCaseMap = new Map<Id, Integer>();
        for (AggregateResult ar : [
            SELECT AccountId accId,
                   COUNT(Id) cnt
            FROM Case
            WHERE AccountId IN :accountIds
              AND IsClosed = false
            GROUP BY AccountId
        ]) {
            Id accId = (Id) ar.get('accId');
            if (accId == null) continue;

            Integer cnt = (Integer) ar.get('cnt');
            openCaseMap.put(accId, cnt == null ? 0 : cnt);
        }

        // =========================
        // 4) Customer_360__c 업데이트
        // =========================
        List<Customer_360__c> toUpdate = new List<Customer_360__c>();

        for (Id accId : accountIds) {
            if (accId == null) continue;

            Customer_360__c c360 = c360Map.get(accId);
            if (c360 == null) continue;

            Integer orderCnt = orderCntMap.containsKey(accId) ? orderCntMap.get(accId) : 0;
            Decimal totalAmt = totalAmtMap.containsKey(accId) ? totalAmtMap.get(accId) : 0;
            Date lastPurchaseDate = lastDateMap.get(accId);
            Decimal lastOrderAmt = lastOrderAmountMap.containsKey(accId) ? lastOrderAmountMap.get(accId) : 0;

            Decimal avg = (orderCnt > 0) ? (totalAmt / orderCnt) : 0;

            // 고객 상태
            String status;
            if (lastPurchaseDate == null) {
                status = 'Dormant';
            } else {
                Integer days = lastPurchaseDate.daysBetween(Date.today());
                if (days <= 90) status = 'Active';
                else if (days <= 180) status = 'At Risk';
                else status = 'Dormant';
            }

            // 등급 계산
            String tier;
            if (orderCnt == 0) {
                tier = 'NEW';
            } else if (totalAmt >= 200000000) {
                tier = 'TRINITY';
            } else if (totalAmt >= 120000000) {
                tier = 'BLACK DIAMOND';
            } else if (totalAmt >= 70000000) {
                tier = 'DIAMOND';
            } else if (totalAmt >= 50000000) {
                tier = 'PLATINUM';
            } else if (totalAmt >= 30000000) {
                tier = 'GOLD';
            } else if (totalAmt >= 10000000) {
                tier = 'BLACK';
            } else {
                tier = 'RED';
            }

            // 구매 필드 세팅
            c360.Total_Order_Count__c = orderCnt;
            c360.Total_Purchase_Amount__c = totalAmt;
            c360.Last_Purchase_Date__c = lastPurchaseDate;
            c360.Last_Order_Amount__c = lastOrderAmt;
            c360.Avg_Order_Value__c = avg;

            // 문의 필드 세팅
            c360.Total_Case_Count__c = totalCaseMap.containsKey(accId) ? totalCaseMap.get(accId) : 0;
            c360.Open_Case_Count__c  = openCaseMap.containsKey(accId) ? openCaseMap.get(accId) : 0;
            c360.Last_Case_Date__c   = lastCaseDateMap.get(accId);

            // 상태/등급
            c360.Customer_Status__c = status;
            c360.Customer_Tier__c = tier;

            toUpdate.add(c360);
        }

        if (!toUpdate.isEmpty()) update toUpdate;
    }
}
