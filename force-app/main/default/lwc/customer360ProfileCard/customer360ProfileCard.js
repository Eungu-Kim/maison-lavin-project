import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

import maleAvatar from '@salesforce/resourceUrl/maleAvatar';
import femaleAvatar from '@salesforce/resourceUrl/femaleAvatar';

// ✅ Customer_360__c fields
const C360_FIELDS = [
    'Customer_360__c.Account__c',
    'Customer_360__c.Total_Order_Count__c',
    'Customer_360__c.Total_Purchase_Amount__c',
    'Customer_360__c.Last_Purchase_Date__c',
    'Customer_360__c.Last_Order_Amount__c',
    'Customer_360__c.Avg_Order_Value__c',
    'Customer_360__c.Open_Case_Count__c',
    'Customer_360__c.Total_Case_Count__c',
    'Customer_360__c.Last_Case_Date__c',
    'Customer_360__c.Last_Interaction_Date__c',
    'Customer_360__c.Preferred_Channel__c',
    'Customer_360__c.Customer_Tier__c',
    'Customer_360__c.Customer_Status__c'
];

// ✅ Account fields
const ACCOUNT_FIELDS = [
    'Account.Name',
    'Account.Customer_Number__c',
    'Account.Salutation',
    'Account.Main_Store__r.Name',
    'Account.City_District__c',
    'Account.PersonBirthdate'
];

export default class Customer360ProfileCard extends LightningElement {
    @api recordId;

    c360Data;
    accountData;

    @wire(getRecord, { recordId: '$recordId', fields: C360_FIELDS })
    wiredC360({ data, error }) {
        if (data) {
            this.c360Data = data;
        } else if (error) {
            // eslint-disable-next-line no-console
            console.error('Customer_360__c 로드 실패:', error);
        }
    }

    // Customer_360__c에서 Account__c를 뽑아 Account 조회에 사용
    get accountId() {
        return this.c360Data?.fields?.Account__c?.value || null;
    }

    @wire(getRecord, { recordId: '$accountId', fields: ACCOUNT_FIELDS })
    wiredAccount({ data, error }) {
        if (data) {
            this.accountData = data;
        } else if (error) {
            // eslint-disable-next-line no-console
            console.error('Account 로드 실패:', error);
        }
    }

    /* ================= Avatar ================= */
    get avatarUrl() {
        const salutation = this.accountData?.fields?.Salutation?.value;
        return salutation === 'Ms.' ? femaleAvatar : maleAvatar;
    }

    /* ================= Account basic ================= */
    get accountName() {
        return this.accountData?.fields?.Name?.value || '-';
    }

    get customerNumber() {
        const number = this.accountData?.fields?.Customer_Number__c?.value;
        return number ? `고객번호: ${number}` : '';
    }

    get mainStore() {
        return this.accountData?.fields?.Main_Store__r?.value?.fields?.Name?.value || '-';
    }

    get address() {
        return this.accountData?.fields?.City_District__c?.value || '-';
    }

    get birthdate() {
        const date = this.accountData?.fields?.PersonBirthdate?.value;
        return date ? this.formatDate(date) : '-';
    }

    /* ================= Customer 360 KPI ================= */
    get hasC360() {
        return !!this.c360Data?.id;
    }

    // 구매
    get totalOrderCount() {
        return this.formatNumber(this.c360Data?.fields?.Total_Order_Count__c?.value);
    }

    get totalPurchaseAmount() {
        return this.formatCurrency(this.c360Data?.fields?.Total_Purchase_Amount__c?.value);
    }

    get lastPurchaseDate() {
        const d = this.c360Data?.fields?.Last_Purchase_Date__c?.value;
        return d ? this.formatDate(d) : '-';
    }

    // 문의
    get openCaseCount() {
        return this.formatNumber(this.c360Data?.fields?.Open_Case_Count__c?.value);
    }

    get totalCaseCount() {
        return this.formatNumber(this.c360Data?.fields?.Total_Case_Count__c?.value);
    }

    get lastCaseDate() {
        const d = this.c360Data?.fields?.Last_Case_Date__c?.value;
        return d ? this.formatDate(d) : '-';
    }

    // 커뮤니케이션
    get lastInteractionDate() {
        const d = this.c360Data?.fields?.Last_Interaction_Date__c?.value;
        return d ? this.formatDate(d) : '-';
    }

    get preferredChannel() {
        return this.c360Data?.fields?.Preferred_Channel__c?.value || '-';
    }

    // 상태
    get customerTier() {
        return this.c360Data?.fields?.Customer_Tier__c?.value || '-';
    }

    get customerStatus() {
        return this.c360Data?.fields?.Customer_Status__c?.value || '-';
    }

    /* ================= Utils ================= */
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}.${m}.${d}`;
    }

    formatNumber(value) {
        if (value === null || value === undefined || value === '') return '-';
        const n = Number(value);
        if (Number.isNaN(n)) return '-';
        return n.toLocaleString('ko-KR');
    }

    formatCurrency(value) {
        if (value === null || value === undefined || value === '') return '-';
        const n = Number(value);
        if (Number.isNaN(n)) return '-';
        return `₩${n.toLocaleString('ko-KR')}`;
    }
}
