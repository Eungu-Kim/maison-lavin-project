public without sharing class CareIdentityService { 
    // ▲ 중요: MessagingSession 업데이트 권한 문제를 피하기 위해 'without sharing' 권장 (상황에 따라 'with sharing' 유지 가능)

    // ====== 공통 결과 DTO ======
    public class IdentityResult {
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

        // LWC용 속성들 (기존 유지)
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

    // ====== (선택) LWC용 메서드 (기존 유지) ======
    @AuraEnabled(cacheable=false)
    public static IdentityResult resolveByOrderAndEmail(String orderNumber, String email) {
        // LWC에서는 세션 ID 업데이트가 필요 없으므로 null 전달
        IdentityResult out = doResolve(orderNumber, email, null); 
        out.syncAura();
        return out;
    }

    // ====== Agentforce/Flow용 Invocable Request ======
    public class InvocableRequest {
        @InvocableVariable(required=true)
        public String orderNumber;

        @InvocableVariable(required=true)
        public String email;

        // [NEW] Agentforce가 현재 세션 ID를 넘겨줄 수 있도록 변수 추가
        @InvocableVariable(required=false label='Messaging Session ID' description='Optional: If provided, updates the session with the found Account')
        public Id messagingSessionId;
    }

    @InvocableMethod(
        label='LAVIN Care - Identify (Order + Email)'
        description='Identify customer context and optionally update MessagingSession'
    )
    public static List<IdentityResult> identify(List<InvocableRequest> requests) {
        List<IdentityResult> results = new List<IdentityResult>();
        if (requests == null) return results;

        for (InvocableRequest r : requests) {
            // [NEW] 요청에 포함된 세션 ID를 함께 전달
            IdentityResult out = doResolve(r.orderNumber, r.email, r.messagingSessionId);
            results.add(out);
        }
        return results;
    }

    // ====== 실제 로직 (매개변수 추가됨) ======
    private static IdentityResult doResolve(String orderNumber, String email, Id sessionId) {
        IdentityResult out = new IdentityResult();
        out.ok = false;

        String orderNo = (orderNumber == null) ? null : String.valueOf(orderNumber).trim();
        String em = (email == null) ? null : String.valueOf(email).trim().toLowerCase();

        if (String.isBlank(orderNo) || String.isBlank(em)) {
            out.message = '주문번호와 이메일이 필요합니다.';
            return out;
        }

        try {
            // 1) Opportunity 찾기
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

            // 2) Asset 찾기
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

            // [NEW] 세션 ID가 있고, 고객(Account)을 찾았다면 즉시 업데이트 수행
            if (sessionId != null && out.accountId != null) {
                updateSession(sessionId, out.accountId);
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

    // [FIX] MessagingSession 직접 업데이트 대신 MessagingEndUser를 통해 우회 업데이트
    private static void updateSession(Id sessionId, Id accId) {
        try {
            // 1. 현재 세션에 연결된 'MessagingEndUser'의 ID를 조회
            MessagingSession currentSession = [
                SELECT MessagingEndUserId 
                FROM MessagingSession 
                WHERE Id = :sessionId 
                LIMIT 1
            ];

            // 2. MessagingEndUser 레코드의 AccountId를 업데이트
            // (이렇게 하면 MessagingSession의 EndUserAccountId도 자동으로 반영됨)
            if (currentSession.MessagingEndUserId != null) {
                MessagingEndUser endUserToUpdate = new MessagingEndUser(
                    Id = currentSession.MessagingEndUserId,
                    AccountId = accId
                );
                update endUserToUpdate;
            }
        } catch (Exception e) {
            System.debug('Session/EndUser update failed: ' + e.getMessage());
            // 필요한 경우 에러 로그를 남기거나 throw하여 상위로 전파
        }
    }
}