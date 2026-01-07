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

        // ParentRecordId가 없으면 현재 레코드로 연결
        if (!fields.ParentRecordId) {
            fields.ParentRecordId = this.recordId;
        }

        // ✅ 예약 상태를 무조건 "예약 확정"으로 강제
        fields.Status = '예약 확정';

        this.template
            .querySelector('lightning-record-edit-form')
            .submit(fields);
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

        // 생성된 예약 레코드로 이동
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