import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

// Account 필드
const FIELDS = [
    'Lead.Telephone_Opt_In__c',
    'Lead.SMS_Opt_In__c',
    'Lead.Email_Opt_In__c'
];

export default class CommunicationChannels extends NavigationMixin(LightningElement) {
    @api recordId;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    lead;

    get isTelephoneOptIn() {
        if (!this.lead || !this.lead.data) return false;
        const value = this.lead.data.fields.Telephone_Opt_In__c?.value;
        console.log('Telephone value:', value);
        return value === true;
    }

    get telephoneIndicatorClass() {
        return this.isTelephoneOptIn ? 'indicator green' : 'indicator red';
    }

    get isSMSOptIn() {
        if (!this.lead || !this.lead.data) return false;
        const value = this.lead.data.fields.SMS_Opt_In__c?.value;
        console.log('SMS value:', value);
        return value === true;
    }

    get smsIndicatorClass() {
        return this.isSMSOptIn ? 'indicator green' : 'indicator red';
    }

    get isEmailOptIn() {
        if (!this.lead || !this.lead.data) return false;
        const value = this.lead.data.fields.Email_Opt_In__c?.value;
        console.log('Email value:', value);
        return value === true;
    }

    get emailIndicatorClass() {
        return this.isEmailOptIn ? 'indicator green' : 'indicator red';
    }

// Telephone 클릭
    handleTelephoneClick() {
        if (!this.isTelephoneOptIn) {
            this.showToast('수신거부', '고객이 전화 수신을 거부했습니다.', 'warning');
            return;
        }
        this.showToast('전화 연결', '전화를 연결합니다.', 'success');
    }

    // SMS 클릭
    handleSMSClick() {
        if (!this.isSMSOptIn) {
            this.showToast('수신거부', '고객이 SMS 수신을 거부했습니다.', 'warning');
            return;
        }
        this.showToast('SMS 전송', 'SMS를 전송합니다.', 'success');
    }

    // Email 클릭
    handleEmailClick() {
        // 수신 거부 체크 로직 유지
        if (!this.isEmailOptIn) {
            this.showToast('수신거부', '고객이 Email 수신을 거부했습니다.', 'warning');
            return;
        }

        // 3. 표준 이메일 작성창 호출
        this[NavigationMixin.Navigate]({
            type: 'standard__quickAction',
            attributes: {
                apiName: 'Global.SendEmail' // Salesforce 표준 이메일 액션 API명
            },
            state: {
                recordId: this.recordId // 현재 레코드 ID를 넘겨주어 '관련 항목'이 자동 지정되게 함
            }
        });
    }

    // Toast 메시지 표시
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}