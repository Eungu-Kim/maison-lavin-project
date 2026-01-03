import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

import maleAvatar from '@salesforce/resourceUrl/maleAvatar';
import femaleAvatar from '@salesforce/resourceUrl/femaleAvatar';

const FIELDS = [
  'ServiceAppointment.AppointmentNumber',
  'ServiceAppointment.Status',
  'ServiceAppointment.SchedStartTime',
  'ServiceAppointment.SchedEndTime',
  'ServiceAppointment.Subject',
  'ServiceAppointment.Description',
  'ServiceAppointment.ParentRecordId',

  'ServiceAppointment.AccountId',
  'ServiceAppointment.Account.Name',
  'ServiceAppointment.Account.Salutation'
];

export default class AppointmentProfileCard extends LightningElement {
  @api recordId;
  appointmentData;

  @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
  wiredAppointment({ data, error }) {
    if (data) {
      this.appointmentData = data;
    } else if (error) {
      // eslint-disable-next-line no-console
      console.error('ServiceAppointment 데이터 로드 실패:', error);
      this.appointmentData = null;
    }
  }

  get avatarUrl() {
    const salutation = this.appointmentData?.fields?.Account?.value?.fields?.Salutation?.value;
    return salutation === 'Ms.' ? femaleAvatar : maleAvatar;
  }

  get accountName() {
    return this.appointmentData?.fields?.Account?.value?.fields?.Name?.value || '-';
  }

  get appointmentNumber() {
    const num = this.appointmentData?.fields?.AppointmentNumber?.value;
    return num ? `예약번호: ${num}` : '예약번호: -';
  }

  get status() {
    return this.appointmentData?.fields?.Status?.value || '-';
  }

  get schedStart() {
    const dt = this.appointmentData?.fields?.SchedStartTime?.value;
    return dt ? this.formatDateTime(dt) : '-';
  }

  get schedEnd() {
    const dt = this.appointmentData?.fields?.SchedEndTime?.value;
    return dt ? this.formatDateTime(dt) : '-';
  }

  get subject() {
    return this.appointmentData?.fields?.Subject?.value || '-';
  }

  get description() {
    return this.appointmentData?.fields?.Description?.value || '-';
  }

  get parentRecordId() {
    return this.appointmentData?.fields?.ParentRecordId?.value || '-';
  }

  formatDateTime(dateString) {
    try {
      const d = new Date(dateString);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
    } catch (e) {
      return dateString;
    }
  }
}