public with sharing class QuotationPDFController {
    
    public Opportunity opp { get; set; }
    public String customerName { get; set; }
    public String managerName { get; set; }
    public String productName { get; set; }
    public Decimal productPrice { get; set; }
    
    // 디자인 타입별 가격 매핑 (한글 → 영문)
    private Map<String, Decimal> designTypePrices = new Map<String, Decimal>{
        '이니셜' => 500000,
        '패치' => 600000,
        '자수' => 800000,
        '스터드' => 900000
    };
    
    // 디자인 타입별 영문 라벨 매핑 (_Price 추가)
    private Map<String, String> designTypeLabels = new Map<String, String>{
        '이니셜' => 'Initial_Price',
        '패치' => 'Patch_Price',
        '자수' => 'Embroidery_Price',
        '스터드' => 'Stud_Price'
    };
    
    // 최종 시안
    public String selectedDesignUrl { get; set; }
    public String selectedDesignTitle { get; set; }
    
    // 디자인 타입 목록
    public List<DesignTypeWrapper> designTypes { get; set; }
    
    public QuotationPDFController(ApexPages.StandardController stdController) {
        // Opportunity 로드
        this.opp = [
            SELECT Id, Name, Total_Amount__c, 
                   Account.Name, Account.Eng_Name__c,
                   Owner.Name, Owner.Eng_Name__c,
                   Selected_Product__c, Selected_Product__r.Name, Selected_Product__r.Price__c,
                   Selected_Design_Id__c, Custom_Initials__c,
                   Design_Type__c
            FROM Opportunity
            WHERE Id = :stdController.getId()
            LIMIT 1
        ];
        
        // 영문 이름 사용
        this.customerName = this.opp.Account != null && String.isNotBlank(this.opp.Account.Eng_Name__c)
            ? this.opp.Account.Eng_Name__c 
            : (this.opp.Account != null ? this.opp.Account.Name : '');
            
        this.managerName = this.opp.Owner != null && String.isNotBlank(this.opp.Owner.Eng_Name__c)
            ? this.opp.Owner.Eng_Name__c 
            : (this.opp.Owner != null ? this.opp.Owner.Name : '');
            
        // Product는 Name 그대로 사용
        this.productName = this.opp.Selected_Product__r != null 
            ? this.opp.Selected_Product__r.Name 
            : this.opp.Name;
            
        this.productPrice = this.opp.Selected_Product__r != null && this.opp.Selected_Product__r.Price__c != null 
            ? this.opp.Selected_Product__r.Price__c 
            : 0;
        
        // 디자인 타입 파싱
        parseDesignTypes();
        
        // 최종 시안 이미지만 로드
        loadSelectedDesign();
    }
    
    /**
     * 디자인 타입 파싱 (영문으로)
     */
    private void parseDesignTypes() {
        this.designTypes = new List<DesignTypeWrapper>();
        
        if (String.isBlank(opp.Design_Type__c)) {
            return;
        }
        
        // Multi-Select Picklist는 세미콜론으로 구분
        List<String> types = opp.Design_Type__c.split(';');
        
        for (String type : types) {
            String trimmedType = type.trim();
            Decimal price = designTypePrices.get(trimmedType);
            String label = designTypeLabels.get(trimmedType);
            
            if (price != null && label != null) {
                this.designTypes.add(new DesignTypeWrapper(label, price));
            }
        }
    }
    
    /**
     * 최종 시안 이미지 로드
     */
    private void loadSelectedDesign() {
        if (String.isBlank(opp.Selected_Design_Id__c)) {
            return;
        }
        
        try {
            List<ContentVersion> versions = [
                SELECT Id, Title
                FROM ContentVersion
                WHERE ContentDocumentId = :opp.Selected_Design_Id__c
                AND IsLatest = true
                LIMIT 1
            ];
            
            if (!versions.isEmpty()) {
                ContentVersion cv = versions[0];
                this.selectedDesignTitle = String.isNotBlank(opp.Custom_Initials__c) 
                    ? opp.Custom_Initials__c 
                    : cv.Title;
                this.selectedDesignUrl = '/sfc/servlet.shepherd/version/download/' + cv.Id;
            }
            
        } catch (Exception e) {
            System.debug('Error loading selected design: ' + e.getMessage());
        }
    }
    
    /**
     * Design Type Wrapper Class
     */
    public class DesignTypeWrapper {
        public String label { get; set; }
        public Decimal price { get; set; }
        
        public DesignTypeWrapper(String label, Decimal price) {
            this.label = label;
            this.price = price;
        }
    }
}