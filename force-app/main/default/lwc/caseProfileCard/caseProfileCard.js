import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import maleAvatar from '@salesforce/resourceUrl/maleAvatar';
import femaleAvatar from '@salesforce/resourceUrl/femaleAvatar';

const FIELDS = [
  'Case.CaseNumber',
  'Case.Status',
  'Case.RequestType__c',
  'Case.Store__c',
  'Case.Store__r.Name',
  'Case.AccountId',
  'Case.Account.Name',
  'Case.Account.Salutation'
];

export default class CaseProfileCard extends LightningElement {
  @api recordId;
  caseData;

  @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
  wiredCase({ data, error }) {
    if (data) {
      this.caseData = data;
    } else if (error) {
      // eslint-disable-next-line no-console
      console.error('Case 데이터 로드 실패:', error);
      this.caseData = null;
    }
  }

  get avatarUrl() {
    const salutation = this.caseData?.fields?.Account?.value?.fields?.Salutation?.value;
    return salutation === 'Ms.' ? femaleAvatar : maleAvatar;
  }

  get accountName() {
    return this.caseData?.fields?.Account?.value?.fields?.Name?.value || '-';
  }

  get caseNumber() {
    const num = this.caseData?.fields?.CaseNumber?.value;
    return num ? `문의번호: ${num}` : '문의번호: -';
  }

  get requestType() {
    return this.caseData?.fields?.RequestType__c?.value || '-';
  }

  get storeName() {
    return this.caseData?.fields?.Store__r?.value?.fields?.Name?.value || '-';
  }

  get status() {
    return this.caseData?.fields?.Status?.value || '-';
  }
}