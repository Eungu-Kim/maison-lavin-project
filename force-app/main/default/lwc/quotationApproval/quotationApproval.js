import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getOpportunityForApproval from '@salesforce/apex/QuotationApprovalService.getOpportunityForApproval';
import approveQuotation from '@salesforce/apex/QuotationApprovalService.approveQuotation';
import rejectQuotation from '@salesforce/apex/QuotationApprovalService.rejectQuotation';

import getLostReasonPicklistValues from '@salesforce/apex/QuotationApprovalService.getLostReasonPicklistValues';

export default class QuotationApproval extends LightningElement {
  @track opp;
  @track error = '';
  @track loading = true;

  @track showReject = false;
  @track rejectReason = '';

  @track lostReasonOptions = [];
  @track lostReasonLoading = false;

  oppId;
  actionDisabled = false;

  connectedCallback() {
    const url = new URL(window.location.href);
    this.oppId = url.searchParams.get('oppId');
    this.load();
  }

  get noPdf() {
    return !this.oppId;
  }

  get vfHost() {
    const host = window.location.host;
    const parts = host.split('.');
    if (parts.length < 2) return '';
    const myDomain = parts[0];
    const instance = parts[1];
    return `${myDomain}--c.${instance}.vf.force.com`;
  }

  get quotationPdfUrl() {
    if (!this.oppId) return '';
    const vfHost = this.vfHost;
    if (!vfHost) return '';
    return `https://${vfHost}/apex/QuotationPDF?id=${this.oppId}`;
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

  openPdfInNewTab = () => {
    const url = this.quotationPdfUrl;
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

  async openRejectModal() {
    this.rejectReason = '';
    this.showReject = true;

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