import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';
import takeOrder from '@salesforce/apex/OpportunityController.takeOrder';
import getProductImage from '@salesforce/apex/ProductCustomizerController.getProductImage';

// Opportunity 실제 필드들
const FIELDS = [
    'Opportunity.Selected_Product__c',
    'Opportunity.Selected_Product__r.Family',
    'Opportunity.Selected_Product__r.Name',
    'Opportunity.Custom_Initials__c',
    'Opportunity.Initials_Color__c',
    'Opportunity.Initials_Position__c',
    'Opportunity.Pickup_Store__r.Name'
];

export default class AssignProduction extends NavigationMixin(LightningElement) {
    @api recordId;
    
    isModalOpen = false;
    isLoading = false;
    
    // 주문 데이터
    selectedFamily;
    productName;
    productImageUrl;
    initials;
    initialsColor;
    initialsPosition;
    positionLabel;
    storeName;
    selectedProductId;
    
    wiredOpportunityResult;
    
    // Wire로 Opportunity 데이터 가져오기
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredOrder(result) {
        this.wiredOpportunityResult = result;
        const { error, data } = result;
        
        if (data) {
            console.log('Opportunity Data:', data);
            
            this.selectedProductId = data.fields.Selected_Product__c?.value;
            this.selectedFamily = data.fields.Selected_Product__r?.value?.fields?.Family?.value;
            this.productName = data.fields.Selected_Product__r?.value?.fields?.Name?.value;
            this.initials = data.fields.Custom_Initials__c?.value;
            this.initialsColor = data.fields.Initials_Color__c?.value || '#ffd900ff';
            this.initialsPosition = data.fields.Initials_Position__c?.value;
            this.positionLabel = this.getPositionLabel(this.initialsPosition);
            this.storeName = data.fields.Pickup_Store__r?.value?.fields?.Name?.value;
            
            // 제품 이미지 로드
            if (this.selectedProductId) {
                this.loadProductImage();
            }
        } else if (error) {
            console.error('Error loading opportunity:', error);
            this.showErrorToast('주문 정보를 불러오는 중 오류가 발생했습니다.');
        }
    }
    
    // 제품 이미지 로드
    loadProductImage() {
        getProductImage({ productId: this.selectedProductId })
            .then(imageUrl => {
                if (imageUrl) {
                    this.productImageUrl = imageUrl;
                } else {
                    console.log('No image found for product');
                }
            })
            .catch(error => {
                console.error('Error loading product image:', error);
            });
    }
    
    // 위치 라벨 변환 (2가지만)
    getPositionLabel(position) {
        const positionMap = {
            'center-top': '상단',
            'center-bottom': '하단'
        };
        return positionMap[position] || position;
    }
    
    // 이니셜 오버레이 클래스
    get initialsOverlayClass() {
        return `initials-overlay position-${this.initialsPosition || 'center-top'}`;
    }
    
    // 이니셜 스타일
    get initialsStyle() {
        return `color: ${this.initialsColor}; font-size: 24px; font-weight: bold;`;
    }
    
    // 색상 미리보기 스타일
    get colorPreviewStyle() {
        return `background-color: ${this.initialsColor};`;
    }
    
    // 이니셜 표시 여부
    get showInitials() {
        return this.initials && this.initials.length > 0;
    }
    
    // 모달 열기
    handleOpenModal() {
        this.isModalOpen = true;
    }
    
    // 모달 닫기
    handleCloseModal() {
        this.isModalOpen = false;
    }
    
    // 확인 및 배정 버튼 클릭
    handleConfirm() {
        this.isLoading = true;
        
        takeOrder({ oppId: this.recordId })
            .then(() => {
                this.showSuccessToast();
                this.isModalOpen = false;
                
                // 페이지 새로고침 - 여러 방법 시도
                return refreshApex(this.wiredOpportunityResult);
            })
            .then(() => {
                // 강제 페이지 새로고침
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: this.recordId,
                        objectApiName: 'Opportunity',
                        actionName: 'view'
                    }
                });
            })
            .catch(error => {
                console.error('Error assigning production:', error);
                this.showErrorToast(error.body?.message || '배정 중 오류가 발생했습니다.');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    
    // 성공 토스트
    showSuccessToast() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: '성공',
                message: '제작 담당자로 배정되었습니다.',
                variant: 'success'
            })
        );
    }
    
    // 에러 토스트
    showErrorToast(message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: '오류',
                message: message,
                variant: 'error'
            })
        );
    }
}