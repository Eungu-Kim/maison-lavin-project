import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import maleAvatar from '@salesforce/resourceUrl/maleAvatar';
import femaleAvatar from '@salesforce/resourceUrl/femaleAvatar';

// Opportunity에서 Account 정보 가져오기
const OPP_FIELDS = [
    'Opportunity.AccountId'
];

// Account 필드 정의
const ACCOUNT_FIELDS = [
    'Account.Name',
    'Account.Customer_Number__c',
    'Account.Salutation',
    'Account.Last_Interaction_Date__c',
    'Account.Main_Store__c',
    'Account.Main_Store__r.Name',
    'Account.City_District__c',
    'Account.Last_Purchase_Date__c',
    'Account.PersonBirthdate'
];

export default class OpportunityProfileCard extends LightningElement {
    @api recordId; // Opportunity ID
    
    accountId;
    accountData;
    
    // 1단계: Opportunity에서 AccountId 가져오기
    @wire(getRecord, { recordId: '$recordId', fields: OPP_FIELDS })
    wiredOpportunity({ data, error }) {
        if (data) {
            this.accountId = data.fields.AccountId?.value;
        } else if (error) {
            console.error('Opportunity 로드 실패:', error);
        }
    }
    
    // 2단계: AccountId로 Account 정보 가져오기
    @wire(getRecord, { recordId: '$accountId', fields: ACCOUNT_FIELDS })
    wiredAccount({ data, error }) {
        if (data) {
            this.accountData = data;
        } else if (error) {
            console.error('Account 데이터 로드 실패:', error);
        }
    }
    
    // 프로필 이미지 (남/여 구분)
    get avatarUrl() {
        if (!this.accountData) return maleAvatar;
        
        const salutation = this.accountData.fields.Salutation?.value;
        return salutation === 'Ms.' ? femaleAvatar : maleAvatar;
    }
    
    // 이름
    get accountName() {
        return this.accountData?.fields.Name?.value || '-';
    }
    
    // 고객번호
    get customerNumber() {
        const number = this.accountData?.fields.Customer_Number__c?.value;
        return number ? `고객번호: ${number}` : '';
    }
    
    // 마지막 연락일
    get lastInteractionDate() {
        const date = this.accountData?.fields.Last_Interaction_Date__c?.value;
        return date ? this.formatDate(date) : '-';
    }
    
    // 담당 매장 (관계 필드에서 Name 가져오기)
    get mainStore() {
        return this.accountData?.fields.Main_Store__r?.value?.fields?.Name?.value || '-';
    }
    
    // 주소 (시/구)
    get address() {
        return this.accountData?.fields.City_District__c?.value || '-';
    }
    
    // 마지막 구매일
    get lastPurchaseDate() {
        const date = this.accountData?.fields.Last_Purchase_Date__c?.value;
        return date ? this.formatDate(date) : '-';
    }
    
    // 생일
    get birthdate() {
        const date = this.accountData?.fields.PersonBirthdate?.value;
        return date ? this.formatDate(date) : '-';
    }
    
    // 날짜 포맷팅 (YYYY.MM.DD)
    formatDate(dateString) {
        if (!dateString) return '-';
        
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}.${month}.${day}`;
    }
}