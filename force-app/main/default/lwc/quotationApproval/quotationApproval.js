import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getOpportunityForApproval from '@salesforce/apex/QuotationApprovalService.getOpportunityForApproval';
import approveQuotation from '@salesforce/apex/QuotationApprovalService.approveQuotation';
import rejectQuotation from '@salesforce/apex/QuotationApprovalService.rejectQuotation';

// ✅ (추가) LostReason__c picklist values
import getLostReasonPicklistValues from '@salesforce/apex/QuotationApprovalService.getLostReasonPicklistValues';

export default class QuotationApproval extends LightningElement {
  @track opp;
  @track error = '';
  @track loading = true;

  @track showReject = false;
  @track rejectReason = '';

  // ✅ (추가) picklist options
  @track lostReasonOptions = [];
  @track lostReasonLoading = false;

  oppId;
  actionDisabled = false;

  connectedCallback() {
    const url = new URL(window.location.href);
    this.oppId = url.searchParams.get('oppId');
    this.load();
  }

  // ✅ 커뮤니티 basePath(/v1) 자동 추출
  get communityBasePath() {
    const p = window.location.pathname; // 예: /v1/s/quotationapproval
    const idx = p.indexOf('/s/');
    return idx >= 0 ? p.substring(0, idx) : '';
  }

  // ✅ 가장 중요한 부분:
  // vf.force.com 링크 대신, 같은 도메인(my.site.com)의 /v1/apex/QuotationPDF 로 강제한다
  get resolvedPdfUrl() {
    if (!this.oppId) return '';
    return `${window.location.origin}${this.communityBasePath}/apex/QuotationPDF?id=${this.oppId}`;
  }

  get noPdf() {
    return !this.oppId;
  }

  async load() {
    this.loading = true;
    this.error = '';

    try {
      if (!this.oppId) {
        throw new Error('oppId가 없습니다. URL에 ?oppId=... 를 포함해야 합니다.');
      }
      this.opp = await getOpportunityForApproval({ oppId: this.oppId });
    } catch (e) {
      this.opp = null;
      this.error = e?.body?.message || e?.message || '조회 중 오류가 발생했습니다.';
    } finally {
      this.loading = false;
    }
  }

  // ✅ 새탭도 같은 도메인 URL로 연다
  openPdfInNewTab = () => {
    const url = this.resolvedPdfUrl;
    if (!url) {
      this.toast('오류', '견적서 URL을 만들 수 없습니다.', 'error');
      return;
    }
    window.open(url, '_blank', 'noopener');
  };

  async handleApprove() {
    this.actionDisabled = true;
    try {
      await approveQuotation({ oppId: this.oppId });
      this.toast('승인 완료', '견적이 승인되었습니다.', 'success');
      await this.load();
    } catch (e) {
      this.toast('오류', e?.body?.message || e?.message || '승인 중 오류', 'error');
    } finally {
      this.actionDisabled = false;
    }
  }

  // ✅ 반려 모달 열 때 picklist 로드
  async openRejectModal() {
    this.rejectReason = '';
    this.showReject = true;

    // 이미 로드해두었다면 재호출 안 함
    if (this.lostReasonOptions && this.lostReasonOptions.length > 0) return;

    this.lostReasonLoading = true;
    try {
      const values = await getLostReasonPicklistValues();
      this.lostReasonOptions = (values || []).map((v) => ({
        label: v,
        value: v
      }));
    } catch (e) {
      this.toast('오류', e?.body?.message || e?.message || '취소사유 목록 조회 실패', 'error');
      this.lostReasonOptions = [];
    } finally {
      this.lostReasonLoading = false;
    }
  }

  closeRejectModal() {
    this.showReject = false;
  }

  // ✅ combobox는 event.detail.value
  handleRejectReasonChange(e) {
    this.rejectReason = e.detail.value;
  }

  async handleReject() {
    const reason = (this.rejectReason || '').trim();
    if (!reason) {
      this.toast('오류', '반려 사유를 선택해주세요.', 'error');
      return;
    }

    this.actionDisabled = true;
    try {
      await rejectQuotation({ oppId: this.oppId, reason });
      this.toast('반려 완료', '반려 사유가 저장되었습니다.', 'success');
      this.showReject = false;
      await this.load();
    } catch (e) {
      this.toast('오류', e?.body?.message || e?.message || '반려 중 오류', 'error');
    } finally {
      this.actionDisabled = false;
    }
  }

  toast(title, message, variant) {
    this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
  }
}