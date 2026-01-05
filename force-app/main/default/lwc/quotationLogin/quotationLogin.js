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
            this.error = '이메일과 비밀번호를 모두 입력해주세요.';
            return;
        }

        this.loading = true;
        try {
            // Apex 호출: 이메일로 최근 기회(Opportunity) ID 조회
            const oppId = await loginAndGetLatestOpportunityId({ email });

            if (!oppId) {
                throw new Error('해당 이메일로 조회된 견적서가 없습니다.');
            }

            // 세션 저장 (선택 사항)
            sessionStorage.setItem('quotation_email', email);

            // 페이지 이동 (/s/quotationapproval)
            // basePath 예: "/maison/s" -> "/maison" 추출 후 경로 조합
            const sitePrefix = basePath.replace(/\/s$/, '');
            const targetUrl = `${window.location.origin}${sitePrefix}/s/quotationapproval?oppId=${oppId}`;
            
            window.location.assign(targetUrl);

        } catch (err) {
            this.error = err?.body?.message || err?.message || '로그인 정보를 확인해주세요.';
            console.error(err);
        } finally {
            this.loading = false;
        }
    }
}