public with sharing class CareIdentityService {

    // ====== 공통 결과 DTO (Agentforce/Flow/LWC 공용으로 쓰기 좋게) ======
    public class IdentityResult {
        // Agentforce/Flow용
        @InvocableVariable public Boolean ok;
        @InvocableVariable public String message;

        @InvocableVariable public Id opportunityId;
        @InvocableVariable public Id accountId;
        @InvocableVariable public Id assetId;
        @InvocableVariable public Id product2Id;

        @InvocableVariable public String customerName;
        @InvocableVariable public String customerEmail;

        @InvocableVariable public String orderNumber;
        @InvocableVariable public String productName;
        @InvocableVariable public Date purchaseDate;

        // LWC에서 바로 쓰고 싶으면 같이 붙여도 됨(@AuraEnabled는 LWC 호출용) :contentReference[oaicite:2]{index=2}
        @AuraEnabled public Boolean auraOk;
        @AuraEnabled public String auraMessage;
        @AuraEnabled public Id auraOpportunityId;
        @AuraEnabled public Id auraAccountId;
        @AuraEnabled public Id auraAssetId;
        @AuraEnabled public Id auraProduct2Id;
        @AuraEnabled public String auraCustomerName;
        @AuraEnabled public String auraCustomerEmail;
        @AuraEnabled public String auraOrderNumber;
        @AuraEnabled public String auraProductName;
        @AuraEnabled public Date auraPurchaseDate;

        public void syncAura() {
            auraOk = ok;
            auraMessage = message;
            auraOpportunityId = opportunityId;
            auraAccountId = accountId;
            auraAssetId = assetId;
            auraProduct2Id = product2Id;
            auraCustomerName = customerName;
            auraCustomerEmail = customerEmail;
            auraOrderNumber = orderNumber;
            auraProductName = productName;
            auraPurchaseDate = purchaseDate;
        }
    }

    // ====== (선택) LWC에서 직접 호출하려면 이 메서드 유지 ======
    @AuraEnabled(cacheable=false)
    public static IdentityResult resolveByOrderAndEmail(String orderNumber, String email) {
        IdentityResult out = doResolve(orderNumber, email);
        out.syncAura();
        return out;
    }

    // ====== Agentforce/Flow에 노출되는 Invocable ======
    public class InvocableRequest {
        @InvocableVariable(required=true)
        public String orderNumber;

        @InvocableVariable(required=true)
        public String email;
    }

    @InvocableMethod(
        label='LAVIN Care - Identify (Order + Email)'
        description='Identify customer/product context by Opportunity.OrderNumber__c and Account.Custom_Email__c'
    )
    public static List<IdentityResult> identify(List<InvocableRequest> requests) {
        List<IdentityResult> results = new List<IdentityResult>();
        if (requests == null) return results;

        for (InvocableRequest r : requests) {
            IdentityResult out = doResolve(r.orderNumber, r.email);
            results.add(out);
        }
        return results;
    }

    // ====== 실제 로직(1곳만 유지) ======
    private static IdentityResult doResolve(String orderNumber, String email) {
        IdentityResult out = new IdentityResult();
        out.ok = false;

        String orderNo = (orderNumber == null) ? null : String.valueOf(orderNumber).trim();
        String em = (email == null) ? null : String.valueOf(email).trim().toLowerCase();

        if (String.isBlank(orderNo) || String.isBlank(em)) {
            out.message = '주문번호와 이메일이 필요합니다.';
            return out;
        }

        try {
            // 1) Opportunity 찾기 (주문번호 + Account.Custom_Email__c)
            Opportunity opp = [
                SELECT Id, AccountId, OrderNumber__c,
                       Account.Name, Account.Custom_Email__c
                FROM Opportunity
                WHERE OrderNumber__c = :orderNo
                  AND Account.Custom_Email__c = :em
                LIMIT 1
            ];

            out.opportunityId = opp.Id;
            out.accountId = opp.AccountId;
            out.customerName = opp.Account.Name;
            out.customerEmail = (String)opp.Account.get('Custom_Email__c');
            out.orderNumber = (String)opp.get('OrderNumber__c');

            // 2) 고객의 최신 Asset 1개
            List<Asset> assets = [
                SELECT Id, AccountId, Product2Id, PurchaseDate, Name, Product2.Name
                FROM Asset
                WHERE AccountId = :opp.AccountId
                ORDER BY PurchaseDate DESC NULLS LAST, CreatedDate DESC
                LIMIT 1
            ];

            if (!assets.isEmpty()) {
                Asset a = assets[0];
                out.assetId = a.Id;
                out.product2Id = a.Product2Id;
                out.productName = a.Name;
                out.purchaseDate = a.PurchaseDate;
            }

            out.ok = true;
            out.message = 'OK';
            return out;

        } catch (QueryException qe) {
            out.ok = false;
            out.message = '주문번호/이메일로 주문을 찾지 못했습니다.';
            return out;
        } catch (Exception e) {
            out.ok = false;
            out.message = '처리 중 오류: ' + e.getMessage();
            return out;
        }
    }
}
