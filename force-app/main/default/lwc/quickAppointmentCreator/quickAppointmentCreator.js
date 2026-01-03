import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class QuickAppointmentCreator extends NavigationMixin(LightningElement) {
    @api recordId; // MessagingSession Id
    isLoading = false;

    handleSubmit(event) {
        event.preventDefault();
        this.isLoading = true;

        const fields = event.detail.fields;

        // 사용자가 ParentRecordId를 선택하지 않았으면, 기본으로 현재 레코드(=MessagingSession)로 연결
        if (!fields.ParentRecordId) {
            fields.ParentRecordId = this.recordId;
        }

        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    handleSuccess(event) {
        this.isLoading = false;
        const appointmentId = event.detail.id;

        this.dispatchEvent(
            new ShowToastEvent({
                title: '성공',
                message: '예약이 생성되었습니다.',
                variant: 'success'
            })
        );

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: appointmentId,
                objectApiName: 'ServiceAppointment',
                actionName: 'view'
            }
        });
    }

    handleError() {
        this.isLoading = false;
    }
}