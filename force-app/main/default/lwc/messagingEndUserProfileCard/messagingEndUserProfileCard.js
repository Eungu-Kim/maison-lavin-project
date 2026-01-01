import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

// 정적 리소스: 성별에 따른 아바타 이미지
import maleAvatar from '@salesforce/resourceUrl/maleAvatar';
import femaleAvatar from '@salesforce/resourceUrl/femaleAvatar';

// Messaging Session 필드: 연결된 Account ID를 찾기 위함
import SESSION_ACCOUNT_ID from '@salesforce/schema/MessagingSession.MessagingEndUser.AccountId';

// Account 상세 필드 정의 (Person Account 환경 대응)
const ACCOUNT_FIELDS = [
    'Account.Name',
    'Account.Customer_Number__c',
    'Account.Salutation',
    'Account.Last_Interaction_Date__c',
    'Account.Main_Store__r.Name',
    'Account.City_District__c',
    'Account.Last_Purchase_Date__c',
    'Account.PersonBirthdate',
    'Account.Telephone_Opt_In__c',
    'Account.SMS_Opt_In__c',
    'Account.Email_Opt_In__c'
];

export default class MessagingEndUserProfileCard extends NavigationMixin(LightningElement) {
    @api recordId; // 현재 Messaging Session의 ID
    accountId;    // 추출된 고객(Account) ID

    // 1. Messaging Session에서 고객인적사항(AccountId) 추출
    @wire(getRecord, { recordId: '$recordId', fields: [SESSION_ACCOUNT_ID] })
    wiredSession({ error, data }) {
        if (data) {
            this.accountId = getFieldValue(data, SESSION_ACCOUNT_ID);
        } else if (error) {
            console.error('세션 데이터 로드 실패:', error);
        }
    }

    // 2. 확보한 AccountId로 실제 고객 정보 조회 (Chained Wire)
    @wire(getRecord, { recordId: '$accountId', fields: ACCOUNT_FIELDS })
    account;

    // --- 데이터 접근 Getter ---
    get accountData() {
        return this.account.data;
    }

    // 성별(Salutation)에 따른 프로필 이미지 분기 로직
    get avatarUrl() {
        const salutation = getFieldValue(this.accountData, 'Account.Salutation');
        return salutation === 'Ms.' ? femaleAvatar : maleAvatar;
    }

    get accountName() {
        return getFieldValue(this.accountData, 'Account.Name') || 'Guest';
    }

    get customerNumber() {
        const num = getFieldValue(this.accountData, 'Account.Customer_Number__c');
        return num ? `고객번호: ${num}` : '';
    }

    // --- 하단 채널 인디케이터(상태 점) 클래스 로직 ---
    get isTelephoneOptIn() {
        return getFieldValue(this.accountData, 'Account.Telephone_Opt_In__c') === true;
    }
    get telephoneIndicatorClass() {
        return `indicator ${this.isTelephoneOptIn ? 'green' : 'red'}`;
    }

    get isSMSOptIn() {
        return getFieldValue(this.accountData, 'Account.SMS_Opt_In__c') === true;
    }
    get smsIndicatorClass() {
        return `indicator ${this.isSMSOptIn ? 'green' : 'red'}`;
    }

    get isEmailOptIn() {
        return getFieldValue(this.accountData, 'Account.Email_Opt_In__c') === true;
    }
    get emailIndicatorClass() {
        return `indicator ${this.isEmailOptIn ? 'green' : 'red'}`;
    }

    // --- 상세 정보 포맷팅 Getter ---
    get lastInteractionDate() {
        return this.formatDate(getFieldValue(this.accountData, 'Account.Last_Interaction_Date__c'));
    }

    get lastPurchaseDate() {
        return this.formatDate(getFieldValue(this.accountData, 'Account.Last_Purchase_Date__c'));
    }

    get birthdate() {
        return this.formatDate(getFieldValue(this.accountData, 'Account.PersonBirthdate'));
    }

    get mainStore() {
        return getFieldValue(this.accountData, 'Account.Main_Store__r.Name') || '-';
    }

    get address() {
        return getFieldValue(this.accountData, 'Account.City_District__c') || '-';
    }

    // --- 이벤트 핸들러: 클릭 시 수신 동의 여부 체크 ---
    handleTelephoneClick() {
        if (!this.isTelephoneOptIn) {
            this.showToast('수신거부', '고객이 전화 수신을 거부했습니다.', 'warning');
            return;
        }
        this.showToast('전화 연결', '전화를 연결합니다.', 'success');
    }

    handleSMSClick() {
        if (!this.isSMSOptIn) {
            this.showToast('수신거부', '고객이 SMS 수신을 거부했습니다.', 'warning');
            return;
        }
        this.showToast('SMS 전송', 'SMS를 전송합니다.', 'success');
    }

    handleEmailClick() {
        if (!this.isEmailOptIn) {
            this.showToast('수신거부', '고객이 Email 수신을 거부했습니다.', 'warning');
            return;
        }

        // 표준 이메일 작성창(Quick Action) 호출
        this[NavigationMixin.Navigate]({
            type: 'standard__quickAction',
            attributes: {
                apiName: 'Global.SendEmail'
            },
            state: {
                recordId: this.accountId
            }
        });
    }

    // --- 유틸리티 함수 ---
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}