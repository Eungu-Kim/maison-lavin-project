import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation'; // 페이지 이동


import ACC_ID_FIELD from '@salesforce/schema/MessagingSession.MessagingEndUser.AccountId'; //

export default class QuickCaseCreator extends NavigationMixin(LightningElement) {
    @api recordId;
    accId;
    isLoading = false;

    @wire(getRecord, { recordId: '$recordId', fields: [ACC_ID_FIELD] })
    wiredSession({ error, data }) {
        if (data) {
            this.accId = getFieldValue(data, ACC_ID_FIELD);
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        this.isLoading = true;

        const fields = event.detail.fields;

        fields.AccountId = this.accId; //
        fields.Status = 'New';          // 진행 상황: 신규
        fields.Origin = 'Web';          // 문의 유입 경로: 웹

        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    handleSuccess(event) {
        this.isLoading = false;
        const caseId = event.detail.id;

        this.dispatchEvent(
            new ShowToastEvent({
                title: '성공',
                message: '새로운 문의가 생성되었습니다.',
                variant: 'success'
            })
        );

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: caseId,
                objectApiName: 'Case',
                actionName: 'view'
            }
        });
    }

    handleError() {
        this.isLoading = false;
    }
}