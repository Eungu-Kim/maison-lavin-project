import { LightningElement, api } from 'lwc';

export default class QuotationGeneratorModal extends LightningElement {
    @api recordId;
    isModalOpen = false;
    
    openModal() {
        this.isModalOpen = true;
    }
    
    closeModal() {
        this.isModalOpen = false;
    }
    
    handleQuotationGenerated() {
        // 견적서 생성 완료 시
        this.closeModal();
        
        // 페이지 새로고침
        location.reload();
    }
}