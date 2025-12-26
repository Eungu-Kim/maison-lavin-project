import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import loginWithToken from '@salesforce/apex/AutoLoginController.loginWithToken';

export default class MagicLoginHandler extends LightningElement {
    
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference && currentPageReference.state) {
            const token = currentPageReference.state.token;
            
            if (token) {
                this.handleLogin(token);
            } else {
                // 토큰이 없으면 그냥 로그인 페이지로 보냄
                window.location.href = '/s/login';
            }
        }
    }

    handleLogin(token) {
        loginWithToken({ token: token })
            .then(resultUrl => {
                // ★ 가장 중요: Apex가 준 URL로 브라우저를 강제 이동시킴 (이때 세션 쿠키가 적용됨)
                window.location.href = resultUrl;
            })
            .catch(error => {
                console.error('Login Failed', error);
                alert('로그인에 실패했습니다. 관리자에게 문의하세요.');
                window.location.href = '/s/login'; // 실패 시 로그인 화면으로
            });
    }
}