import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOpportunityForApproval from '@salesforce/apex/QuotationApprovalService.getOpportunityForApproval';
import approveQuotation from '@salesforce/apex/QuotationApprovalService.approveQuotation';
import rejectQuotation from '@salesforce/apex/QuotationApprovalService.rejectQuotation';
import getLostReasonPicklistValues from '@salesforce/apex/QuotationApprovalService.getLostReasonPicklistValues';

// 👇👇 [수정 포인트] 여기에 구글 드라이브 공유 링크를 붙여넣으세요 👇👇
const HARDCODED_DRIVE_LINK = 'https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing'; 

export default class QuotationApproval extends LightningElement {
    @track opp;
    @track error = '';
    @track loading = true;
    
    @track googleDriveEmbedUrl = ''; // 변환된 URL이 들어갈 변수

    @track showReject = false;
    @track rejectReason = '';
    @track lostReasonOptions = [];
    @track lostReasonLoading = false;
    
    actionDisabled = false;
    oppId;

    connectedCallback() {
        const url = new URL(window.location.href);
        this.oppId = url.searchParams.get('oppId');
        
        // 1. 하드코딩된 링크를 iframe용으로 변환해서 저장
        this.googleDriveEmbedUrl = this.convertToPreviewUrl(HARDCODED_DRIVE_LINK);
        
        this.load();
    }

    async load() {
        this.loading = true;
        try {
            if (!this.oppId) throw new Error('URL에 oppId 파라미터가 없습니다.');
            
            // 2. 주문 정보(번호, 상태)만 가져옴 (PDF URL은 위에서 하드코딩 사용)
            this.opp = await getOpportunityForApproval({ oppId: this.oppId });

        } catch (e) {
            this.error = e?.body?.message || e?.message;
        } finally {
            this.loading = false;
        }
    }

    // 🔹 구글 드라이브 링크 변환기 (view -> preview)
    convertToPreviewUrl(url) {
        if (!url) return '';
        // 공유 링크(.../view)를 미리보기 링크(.../preview)로 변경
        if (url.includes('drive.google.com') && url.includes('/view')) {
            return url.replace('/view', '/preview').split('?')[0];
        }
        return url;
    }

    handleApprove() {
        this.actionDisabled = true;
        approveQuotation({ oppId: this.oppId })
            .then(() => {
                this.toast('성공', '견적이 승인되었습니다.', 'success');
                this.load();
            })
            .catch(e => this.toast('오류', e.body.message, 'error'))
            .finally(() => this.actionDisabled = false);
    }

    async openRejectModal() {
        this.showReject = true;
        if (this.lostReasonOptions.length > 0) return;
        
        this.lostReasonLoading = true;
        try {
            const values = await getLostReasonPicklistValues();
            this.lostReasonOptions = values.map(v => ({ label: v, value: v }));
        } catch(e) {
            this.toast('오류', '사유 목록 로딩 실패', 'error');
        } finally {
            this.lostReasonLoading = false;
        }
    }

    closeRejectModal() { this.showReject = false; }
    handleRejectReasonChange(e) { this.rejectReason = e.detail.value; }

    handleReject() {
        if (!this.rejectReason) return this.toast('경고', '반려 사유를 선택하세요.', 'warning');
        
        this.actionDisabled = true;
        rejectQuotation({ oppId: this.oppId, reason: this.rejectReason })
            .then(() => {
                this.toast('성공', '반려 처리되었습니다.', 'success');
                this.showReject = false;
                this.load();
            })
            .catch(e => this.toast('오류', e.body.message, 'error'))
            .finally(() => this.actionDisabled = false);
    }

    toast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}