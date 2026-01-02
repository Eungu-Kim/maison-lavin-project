public class MagicLinkGenerator {
    
    // 플로우에서 사용할 입력 변수
    public class FlowInput {
        @InvocableVariable(required=true)
        public String userId; // 로그인할 사용자 ID
    }
    
    // 플로우로 돌려줄 출력 변수
    public class FlowOutput {
        @InvocableVariable
        public String generatedToken; // 생성된 암호화 토큰
    }

    @InvocableMethod(label='Generate Magic Token' description='Generates a time-limited secure token for auto-login.')
    public static List<FlowOutput> generateToken(List<FlowInput> inputs) {
        List<FlowOutput> outputs = new List<FlowOutput>();
        
        for (FlowInput input : inputs) {
            FlowOutput out = new FlowOutput();
            
            // 1. 토큰 생성 로직 (사용자ID + 타임스탬프 + 비밀키 조합)
            // 실제 운영 시에는 더 복잡한 암호화(JWT)를 권장하지만, 테스트용으로 AES 암호화를 사용합니다.
            String payload = input.userId + '|' + String.valueOf(DateTime.now().getTime());
            Blob key = Blob.valueOf('LavinCareAutoLoginKey20251226!!!'); // 32자리의 고정 비밀키 (운영 시 Custom Setting으로 관리 권장)
            Blob encryptedData = Crypto.encryptWithManagedIV('AES256', key, Blob.valueOf(payload));
            
            // 2. URL에서 안전하게 사용할 수 있도록 인코딩
            out.generatedToken = EncodingUtil.base64Encode(encryptedData);
            outputs.add(out);
        }
        return outputs;
    }
}