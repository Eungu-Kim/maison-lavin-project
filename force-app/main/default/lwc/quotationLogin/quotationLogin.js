import { LightningElement, track } from 'lwc';
import basePath from '@salesforce/community/basePath';
import loginAndGetLatestOpportunityId from '@salesforce/apex/QuotationLoginService.loginAndGetLatestOpportunityId';

export default class QuotationLogin extends LightningElement {
  @track email = '';
  @track password = '';
  @track error = '';
  @track loading = false;

  handleEmailChange(e) {
    this.email = e.target.value;
  }
  handlePasswordChange(e) {
    this.password = e.target.value;
  }

  async handleLogin() {
    this.error = '';

    const email = (this.email || '').trim();
    const pw = (this.password || '').trim();

    if (!email || !pw) {
      this.error = '이메일과 비밀번호를 입력해주세요.';
      return;
    }

    // 비밀번호는 아무거나여도 OK → 검증 안 함
    this.loading = true;
    try {
      const oppId = await loginAndGetLatestOpportunityId({ email });

      // (선택) 세션에 저장해두면 approval 화면에서 활용 가능
      sessionStorage.setItem('quotation_email', email);

      // 커뮤니티 prefix 처리: /v1/s 같은 구조 유지
      const sitePrefix = basePath.replace(/\/s$/, '');
      const url = `${window.location.origin}${sitePrefix}/s/quotationapproval?oppId=${oppId}`;
      window.location.assign(url);

    } catch (err) {
      this.error = err?.body?.message || err?.message || '로그인 중 오류가 발생했습니다.';
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      this.loading = false;
    }
  }
}