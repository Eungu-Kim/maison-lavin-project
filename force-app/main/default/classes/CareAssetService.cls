public without sharing class CareAssetService {
    
    // 1. 입력 변수 설정 (Agent가 줄 데이터)
    public class Request {
        @InvocableVariable(label='Routable ID' description='The Messaging Session ID' required=true)
        public String routableID;
    }

    // 2. 출력 변수 설정 (Agent가 받을 데이터)
    public class Response {
        @InvocableVariable(label='Asset Name' description='Name of the purchased product')
        public String assetName;
        
        @InvocableVariable(label='Purchase Date' description='Date when the product was purchased')
        public String purchaseDate;
        
        @InvocableVariable(label='Message' description='Result message for the agent')
        public String message;
    }

    // 3. 실제 동작 메서드 (@InvocableMethod 필수)
    @InvocableMethod(label='고객 최근 구매 제품 조회' description='Gets the most recent asset for the current messaging user based on Routable ID')
    public static List<Response> getRecentAsset(List<Request> requests) {
        List<Response> responses = new List<Response>();
        String recId = requests[0].routableID;
        
        Response res = new Response();
        
        try {
            // MessagingSession을 통해 AccountId 조회
            List<MessagingSession> sessions = [SELECT MessagingEndUser.AccountId FROM MessagingSession WHERE Id = :recId LIMIT 1];
            
            if (!sessions.isEmpty() && sessions[0].MessagingEndUser.AccountId != null) {
                Id accId = sessions[0].MessagingEndUser.AccountId;
                
                // 해당 고객의 최신 Asset 조회 (최근 1건)
                List<Asset> assets = [SELECT Name, PurchaseDate FROM Asset WHERE AccountId = :accId ORDER BY PurchaseDate DESC LIMIT 1];
                
                if (!assets.isEmpty()) {
                    res.assetName = assets[0].Name;
                    // 날짜 형식을 문자열로 변환
                    res.purchaseDate = String.valueOf(assets[0].PurchaseDate); 
                    res.message = 'Found asset: ' + assets[0].Name;
                } else {
                    res.message = 'No assets found for this customer.';
                }
            } else {
                res.message = 'Customer not identified.';
            }
        } catch (Exception e) {
            res.message = 'Error: ' + e.getMessage();
        }
        
        responses.add(res);
        return responses;
    }
}