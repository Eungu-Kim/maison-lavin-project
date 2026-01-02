public without sharing class AutoLoginController {
    
    @AuraEnabled
    public static String loginWithToken(String token) {
        try {
            // 1. 공백 문자 처리 (URL 디코딩 이슈 방지)
            String cleanToken = token.replace(' ', '+');
            
            // 2. 1단계와 동일한 암호화 키 (32자리 필수)
            Blob key = Blob.valueOf('LavinCareAutoLoginKey20251226!!!');
            
            // 3. 복호화 (Decryption)
            Blob decryptedData = Crypto.decryptWithManagedIV('AES256', key, EncodingUtil.base64Decode(cleanToken));
            String payload = decryptedData.toString();
            String[] parts = payload.split('\\|');
            String userId = parts[0];
            Long timestamp = Long.valueOf(parts[1]);
            
            // 4. 유효기간 체크 (24시간)
            if (DateTime.now().getTime() - timestamp > 86400000) {
                throw new AuraHandledException('링크가 만료되었습니다.');
            }
            
            // 5. 유저 확인
            User u = [SELECT Id, Username FROM User WHERE Id = :userId LIMIT 1];
            
            // 6. [핵심] 임시 비밀번호 설정 (Magic Link 방식의 필수 절차)
            // 주의: 이 로직은 고객의 기존 비밀번호를 임시 비밀번호로 덮어씁니다.
            String tempPassword = 'StartCare!' + String.valueOf(DateTime.now().getTime());
            System.setPassword(u.Id, tempPassword);
            
            // 7. 로그인 수행 및 이동할 URL 반환
            // Site.login()은 내부적으로 세션 쿠키를 세팅하고 PageReference를 줍니다.
            ApexPages.PageReference pageRef = Site.login(u.Username, tempPassword, '/care'); 
            
            if (pageRef != null) {
                return pageRef.getUrl(); // 성공 시 이동할 URL 문자열 반환
            } else {
                throw new AuraHandledException('로그인에 실패했습니다.');
            }
            
        } catch (Exception e) {
            System.debug('Login Error: ' + e.getMessage());
            // 보안상 상세 에러는 숨기고 일반적인 메시지 전달
            throw new AuraHandledException('유효하지 않은 링크이거나 시스템 오류입니다.');
        }
    }
}