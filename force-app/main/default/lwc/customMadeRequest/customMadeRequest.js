import { LightningElement, track } from 'lwc';
import isEligibleForCustomMade from '@salesforce/apex/CustomMadeService.isEligibleForCustomMade';
import BACKG1 from '@salesforce/resourceUrl/backg1';

export default class CustomMadeRequest extends LightningElement {
  @track email = '';
  @track password = '';
  @track error = '';
  @track loading = false;

  // 배경 1회만 적용용
  _bgApplied = false;

  handleChange(e) {
    const { name, value } = e.target;
    this[name] = value;
  }

  async handleOrderRequest() {
    this.error = '';

    const email = (this.email || '').trim();
    const pw = (this.password || '').trim();

    if (!email || !pw) {
      this.error = '이메일과 비밀번호를 입력해주세요.';
      return;
    }

    this.loading = true;
    try {
      // 1) Lead 존재 여부 확인 (게스트에서도 true가 나오도록 Apex를 수정해야 함)
      const ok = await isEligibleForCustomMade({ email });

      if (!ok) {
        this.error = '등록된 고객 이메일이 아닙니다.';
        return;
      }

      // 2) /s/productcustomize?email=xxx 로 이동
      const sitePrefix = window.location.pathname.split('/s/')[0] || ''; // 예: /customers 또는 ''(루트)
      const encodedEmail = encodeURIComponent(email);

      const targetUrl = `${window.location.origin}${sitePrefix}/s/productcustomize?email=${encodedEmail}`;
      window.location.assign(targetUrl);
    } catch (err) {
      this.error = err?.body?.message || err?.message || '시스템 오류가 발생했습니다.';
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      this.loading = false;
    }
  }
  // 좌측 배경 이미지 적용
  renderedCallback() {
    if (this._bgApplied) return;

    const el = this.template.querySelector('.cm-left-bg');
    if (!el) return;

    el.style.backgroundImage = `url(${BACKG1})`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.backgroundRepeat = 'no-repeat';

    this._bgApplied = true;
  }

}