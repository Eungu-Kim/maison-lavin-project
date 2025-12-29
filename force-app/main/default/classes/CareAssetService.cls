public with sharing class CareAssetService {
    @InvocableMethod(label='고객의 최근 구매 제품 조회' description='현재 로그인된 고객이 가장 최근에 구매한 Asset 정보를 반환합니다.')
    public static List<AssetResponse> getLatestAsset() {
        // 1. 현재 로그인된 유저의 AccountId 조회
        Id currentUserId = UserInfo.getUserId();
        User u = [SELECT Contact.AccountId FROM User WHERE Id = :currentUserId LIMIT 1];

        // 2. 해당 계정의 가장 최신 Asset 조회
        List<Asset> assets = [SELECT Name, PurchaseDate, Status 
                             FROM Asset 
                             WHERE AccountId = :u.Contact.AccountId 
                             ORDER BY PurchaseDate DESC LIMIT 1];

        List<AssetResponse> responses = new List<AssetResponse>();
        if(!assets.isEmpty()) {
            AssetResponse res = new AssetResponse();
            res.assetName = assets[0].Name;
            res.purchaseDate = assets[0].PurchaseDate;
            responses.add(res);
        }
        return responses;
    }

    public class AssetResponse {
        @InvocableVariable(label='제품명') public String assetName;
        @InvocableVariable(label='구매일') public Date purchaseDate;
    }
}