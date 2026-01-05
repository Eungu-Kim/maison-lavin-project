import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import maleAvatar from '@salesforce/resourceUrl/maleAvatar';
import femaleAvatar from '@salesforce/resourceUrl/femaleAvatar';

// 필드 정의
const FIELDS = [
    'Lead.Name',
    'Lead.Salutation',
    'Lead.City_District__c',
    'Lead.Status'
];

export default class LeadProfileCard extends LightningElement {
    @api recordId;
    
    leadData;
    
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredAccount({ data, error }) {
        if (data) {
            this.leadData = data;
        } else if (error) {
            console.error('데이터 로드 실패:', error);
        }
    }
    
    // 프로필 이미지 (남/여 구분)
    get avatarUrl() {
        if (!this.leadData) return maleAvatar;
        
        const salutation = this.leadData.fields.Salutation?.value;
        return salutation === 'Ms.' ? femaleAvatar : maleAvatar;
    }
    
    // 이름
    get leadName() {
        return this.leadData?.fields.Name?.value || '-';
    }
    
    // 주소 (시/구)
    get address() {
        return this.leadData?.fields.City_District__c?.value || '-';
    }
    
    // 리드 상태
    get status() {
        return this.leadData?.fields.Status?.value || '-';
    }

}