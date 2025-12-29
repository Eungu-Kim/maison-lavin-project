import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import getProductInfo from '@salesforce/apex/QuotationController.getProductInfo';
import getDesignFiles from '@salesforce/apex/QuotationController.getDesignFiles';
import createQuotation from '@salesforce/apex/QuotationController.createQuotation';

import SELECTED_PRODUCT from '@salesforce/schema/Opportunity.Selected_Product__c';
import DESIGN_TYPE from '@salesforce/schema/Opportunity.Design_Type__c';

export default class QuotationGenerator extends LightningElement {
    @api recordId;
    
    // 제작 유형별 가격 매핑
    designTypePrices = {
        '이니셜': 500000,
        '패치': 600000,
        '자수': 800000,
        '스터드': 900000
    };
    
    // 제작 유형 라벨 매핑
    designTypeLabels = {
        'Initial': '이니셜',
        'Patch': '패치',
        'Embroidery': '자수',
        'Stud': '스터드'
    };
    
    @track designFiles = [];
    @track selectedDesignId = null;
    @track selectedDesignUrl = null;
    
    productId = null;
    productName = '';
    productPrice = 0;
    designTypeValue = '';  // Design_Type__c 필드 값
    isDragOver = false;
    
    wiredOpportunityResult;
    
    // Opportunity 로드
    @wire(getRecord, {
        recordId: '$recordId',
        fields: [SELECTED_PRODUCT, DESIGN_TYPE]
    })
    wiredOpportunity(result) {
        this.wiredOpportunityResult = result;
        
        if (result.data) {
            this.productId = result.data.fields.Selected_Product__c.value;
            this.designTypeValue = result.data.fields.Design_Type__c.value || '';
            
            console.log('Design Type Value:', this.designTypeValue);
            
            if (this.productId) {
                this.loadProductInfo();
                this.loadDesignFiles();
            }
        } else if (result.error) {
            console.error('Error loading opportunity:', result.error);
        }
    }
    
    // 제품 정보 로드
    loadProductInfo() {
        getProductInfo({ productId: this.productId })
            .then(result => {
                this.productName = result.name;
                this.productPrice = result.price || 0;
            })
            .catch(error => {
                console.error('Error loading product:', error);
                this.showToast('오류', '제품 정보를 불러올 수 없습니다', 'error');
            });
    }
    
    // 시안 파일 로드
    loadDesignFiles() {
        getDesignFiles({ opportunityId: this.recordId })
            .then(result => {
                this.designFiles = result;
            })
            .catch(error => {
                console.error('Error loading files:', error);
            });
    }
    
    // 드래그 시작
    handleDragStart(event) {
        event.dataTransfer.setData('contentDocId', event.currentTarget.dataset.id);
        event.dataTransfer.effectAllowed = 'move';
    }
    
    // 드래그 오버
    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        this.isDragOver = true;
    }
    
    // 드래그 나감
    handleDragLeave() {
        this.isDragOver = false;
    }
    
    // 드롭
    handleDrop(event) {
        event.preventDefault();
        this.isDragOver = false;
        
        const contentDocId = event.dataTransfer.getData('contentDocId');
        const file = this.designFiles.find(f => f.id === contentDocId);
        
        if (file) {
            this.selectedDesignId = file.id;
            this.selectedDesignUrl = file.downloadUrl;
        }
    }
    
    // 시안 선택 취소
    handleRemoveDesign() {
        this.selectedDesignId = null;
        this.selectedDesignUrl = null;
    }
    
    // 견적서 생성
    handleGenerateQuotation() {
        if (!this.designTypeValue) {
            this.showToast('오류', '제작 유형이 선택되지 않았습니다', 'error');
            return;
        }
        
        if (!this.selectedDesignId) {
            this.showToast('오류', '최종 시안을 선택해주세요', 'error');
            return;
        }
        
        const data = {
            opportunityId: this.recordId,
            designType: this.designTypeValue,
            selectedDesignId: this.selectedDesignId,
            totalAmount: this.totalAmount
        };
        
        createQuotation({ data: JSON.stringify(data) })
            .then(() => {
                this.showToast('성공', '견적서가 생성되었습니다', 'success');
                
                // 부모에게 이벤트 전달 (모달 닫기)
                this.dispatchEvent(new CustomEvent('quotationgenerated'));
                
                return refreshApex(this.wiredOpportunityResult);
            })
            .catch(error => {
                console.error('Error creating quotation:', error);
                this.showToast('오류', error.body?.message || '견적서 생성 중 오류가 발생했습니다', 'error');
            });
    }
    
    // Toast 메시지
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }
    
    // Getters
    get hasDesignFiles() {
        return this.designFiles.length > 0;
    }
    
    get hasSelectedDesign() {
        return this.selectedDesignId !== null;
    }
    
    get hasDesignTypes() {
        return this.designTypeValue && this.designTypeValue.length > 0;
    }
    
    get dropZoneClass() {
        let classes = 'drop-zone slds-text-align_center slds-p-around_large';
        if (this.isDragOver) {
            classes += ' drag-over';
        }
        if (this.hasSelectedDesign) {
            classes += ' has-design';
        }
        return classes;
    }
    
    // Design_Type__c 값을 파싱하여 선택된 유형 목록 반환
    get selectedDesignTypes() {
        if (!this.designTypeValue) {
            return [];
        }
        
        // Multi-Select Picklist는 세미콜론으로 구분
        const types = this.designTypeValue.split(';').map(t => t.trim());
        
        return types.map(type => {
            const price = this.designTypePrices[type] || 0;
            const label = this.designTypeLabels[type] || type;
            
            return {
                value: type,
                label: label,
                price: price,
                formattedPrice: this.formatCurrency(price)
            };
        });
    }
    
    // 제작 유형 추가 금액 합계
    get designSurcharge() {
        return this.selectedDesignTypes.reduce((sum, type) => sum + type.price, 0);
    }
    
    // 총액
    get totalAmount() {
        return this.productPrice + this.designSurcharge;
    }
    
    get formattedProductPrice() {
        return this.formatCurrency(this.productPrice);
    }
    
    get formattedTotalAmount() {
        return this.formatCurrency(this.totalAmount);
    }
    
    get isGenerateDisabled() {
        return !this.hasDesignTypes || !this.selectedDesignId;
    }
    
    // 포맷팅
    formatCurrency(value) {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW'
        }).format(value || 0);
    }
}