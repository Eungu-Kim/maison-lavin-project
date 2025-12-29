public with sharing class QuotationController {
    
    /**
     * Product 정보 조회 (이름 + 가격)
     * @param productId Product2 ID
     * @return ProductWrapper
     */
    @AuraEnabled(cacheable=true)
    public static ProductWrapper getProductInfo(Id productId) {
        try {
            Product2 product = [
                SELECT Name, Price__c
                FROM Product2
                WHERE Id = :productId
                LIMIT 1
            ];
            
            return new ProductWrapper(
                product.Name,
                product.Price__c != null ? product.Price__c : 0
            );
            
        } catch (Exception e) {
            throw new AuraHandledException('제품을 찾을 수 없습니다: ' + e.getMessage());
        }
    }
    
    /**
     * 시안 파일 목록 조회 (이미지만)
     * @param opportunityId Opportunity ID
     * @return List<ContentDocumentWrapper>
     */
    @AuraEnabled(cacheable=true)
    public static List<ContentDocumentWrapper> getDesignFiles(Id opportunityId) {
        List<ContentDocumentWrapper> files = new List<ContentDocumentWrapper>();
        
        try {
            for (ContentDocumentLink cdl : [
                SELECT ContentDocumentId, 
                       ContentDocument.Title,
                       ContentDocument.LatestPublishedVersionId,
                       ContentDocument.FileExtension
                FROM ContentDocumentLink
                WHERE LinkedEntityId = :opportunityId
                AND ContentDocument.FileExtension IN ('png', 'jpg', 'jpeg')
                ORDER BY ContentDocument.CreatedDate DESC
            ]) {
                files.add(new ContentDocumentWrapper(
                    cdl.ContentDocumentId,
                    cdl.ContentDocument.Title,
                    cdl.ContentDocument.LatestPublishedVersionId,
                    '/sfc/servlet.shepherd/version/download/' + cdl.ContentDocument.LatestPublishedVersionId
                ));
            }
            
        } catch (Exception e) {
            throw new AuraHandledException('시안 파일을 불러올 수 없습니다: ' + e.getMessage());
        }
        
        return files;
    }
    
    /**
 * 견적서 생성 및 Opportunity 업데이트
 * @param data JSON 문자열 (opportunityId, designType, selectedDesignId, totalAmount)
 * @return String 성공 메시지
    */
    @AuraEnabled
    public static String createQuotation(String data) {
        try {
            // JSON 파싱
            Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(data);
            
            Id opportunityId = (Id) params.get('opportunityId');
            String designType = (String) params.get('designType');
            String selectedDesignId = (String) params.get('selectedDesignId');
            Decimal totalAmount = Decimal.valueOf(String.valueOf(params.get('totalAmount')));
            
            // 유효성 검사
            if (String.isBlank(designType)) {
                throw new AuraHandledException('디자인 타입을 선택해주세요.');
            }
            
            if (String.isBlank(selectedDesignId)) {
                throw new AuraHandledException('최종 시안을 선택해주세요.');
            }
            
            if (totalAmount == null || totalAmount <= 0) {
                throw new AuraHandledException('총액이 올바르지 않습니다.');
            }
            
            // 1. Opportunity 정보 조회
            Opportunity opp = [
                SELECT Id, Name, AccountId, Account.Name,
                    OrderNumber__c,
                    Selected_Product__r.Name, Custom_Initials__c,
                    Pickup_Store__r.Name
                FROM Opportunity 
                WHERE Id = :opportunityId 
                LIMIT 1
            ];
            
            // 2. Visualforce Page를 PDF로 변환
            PageReference pdfPage = Page.QuotationPDF;
            pdfPage.getParameters().put('id', opportunityId);
            
            Blob pdfBlob;
            if (Test.isRunningTest()) {
                pdfBlob = Blob.valueOf('Test PDF Content');
            } else {
                pdfBlob = pdfPage.getContentAsPDF();
            }
            
            // 3. PDF 파일명 생성
            String pdfFileName = '';
            if (String.isNotBlank(opp.OrderNumber__c)) {
                pdfFileName = opp.OrderNumber__c + '_견적서';
            } else {
                pdfFileName = '견적서_' + opp.Name;
            }
            pdfFileName += '_' + System.now().format('yyyyMMdd') + '.pdf';
            
            // 4. ContentVersion 생성 (PDF 파일 저장)
            ContentVersion cv = new ContentVersion();
            cv.Title = pdfFileName;
            cv.PathOnClient = pdfFileName;
            cv.VersionData = pdfBlob;
            insert cv;
            
            // 5. ContentDocument ID 조회
            ContentVersion insertedCV = [
                SELECT ContentDocumentId 
                FROM ContentVersion 
                WHERE Id = :cv.Id 
                LIMIT 1
            ];
            
            String fileUrl = '/lightning/r/ContentDocument/' + insertedCV.ContentDocumentId + '/view';
            
            // 6. Opportunity 업데이트
            opp.Design_Type__c = designType;
            opp.Selected_Design_Id__c = selectedDesignId;
            opp.Total_Amount__c = totalAmount;
            opp.Quotation_PDF_URL__c = fileUrl;
            opp.Quotation_Generated__c = true;
            opp.Quotation_Generated_Datetime__c = System.now();
            
            update opp;
            
            // 7. Quote 레코드 생성

            // 기존 Quote 개수 조회 (몇 차인지 확인)
            Integer quoteCount = [
                SELECT COUNT() 
                FROM Quote 
                WHERE OpportunityId = :opportunityId
            ];

            Integer nextNumber = quoteCount + 1; // 다음 차수

            Quote newQuote = new Quote();

            // 견적서 이름: "CO-052384 1차 견적서 (2025.12.29)"
            String quoteName = '';
            if (String.isNotBlank(opp.OrderNumber__c)) {
                quoteName = opp.OrderNumber__c;
            } else {
                quoteName = opp.Name;
            }
            quoteName += ' ' + nextNumber + '차 견적서';
            quoteName += ' (' + System.now().format('yyyy.MM.dd') + ')';

            newQuote.Name = quoteName;
            newQuote.OpportunityId = opportunityId;
            newQuote.Status = 'Draft';
            newQuote.ExpirationDate = System.today().addDays(30);

            // 설명 추가
            String description = '자동 생성된 견적서 (' + nextNumber + '차)';

            if (opp.Selected_Product__r != null) {
                description += '\n제품: ' + opp.Selected_Product__r.Name;
            }

            if (String.isNotBlank(opp.Custom_Initials__c)) {
                description += '\n이니셜: ' + opp.Custom_Initials__c;
            }

            if (String.isNotBlank(designType)) {
                String formattedDesignType = designType.replace(';', ', ');
                description += '\n제작 유형: ' + formattedDesignType;
            }

            if (opp.Pickup_Store__r != null) {
                description += '\n픽업 매장: ' + opp.Pickup_Store__r.Name;
            }

            // 금액 정보 추가
            description += '\n\n총 금액: ₩' + String.valueOf(totalAmount.setScale(0).format());

            newQuote.Description = description;

            insert newQuote;
            
            // 8. Quote에 PDF 파일 연결
            ContentDocumentLink quotePdfLink = new ContentDocumentLink();
            quotePdfLink.ContentDocumentId = insertedCV.ContentDocumentId;
            quotePdfLink.LinkedEntityId = newQuote.Id;
            quotePdfLink.ShareType = 'V';
            quotePdfLink.Visibility = 'AllUsers';
            insert quotePdfLink;
            
            // 9. Quote에 시안 이미지 연결
            if (String.isNotBlank(selectedDesignId)) {
                ContentDocumentLink quoteDesignLink = new ContentDocumentLink();
                quoteDesignLink.ContentDocumentId = selectedDesignId;
                quoteDesignLink.LinkedEntityId = newQuote.Id;
                quoteDesignLink.ShareType = 'V';
                quoteDesignLink.Visibility = 'AllUsers';
                insert quoteDesignLink;
            }
            
            return 'Success';
            
        } catch (DmlException e) {
            throw new AuraHandledException('데이터 저장 실패: ' + e.getMessage());
        } catch (Exception e) {
            System.debug('Error: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            throw new AuraHandledException('견적서 생성 실패: ' + e.getMessage());
        }
    }
    
    /**
     * Product Wrapper Class
     */
    public class ProductWrapper {
        @AuraEnabled public String name;
        @AuraEnabled public Decimal price;
        
        public ProductWrapper(String name, Decimal price) {
            this.name = name;
            this.price = price;
        }
    }
    
    /**
     * ContentDocument Wrapper Class
     */
    public class ContentDocumentWrapper {
        @AuraEnabled public String id;
        @AuraEnabled public String title;
        @AuraEnabled public String versionId;
        @AuraEnabled public String downloadUrl;
        
        public ContentDocumentWrapper(String id, String title, String versionId, String downloadUrl) {
            this.id = id;
            this.title = title;
            this.versionId = versionId;
            this.downloadUrl = downloadUrl;
        }
    }
}