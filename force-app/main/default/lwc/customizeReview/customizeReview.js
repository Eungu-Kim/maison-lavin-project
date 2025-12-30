import { LightningElement, api, wire, track } from 'lwc';
import {
    FlowAttributeChangeEvent,
    FlowNavigationBackEvent,
    FlowNavigationNextEvent,
    FlowNavigationFinishEvent
} from 'lightning/flowSupport';

import { getRecord } from 'lightning/uiRecordApi';

import getProductImage from '@salesforce/apex/ProductCustomizerController.getProductImage';
import getAvailableStores from '@salesforce/apex/ProductCustomizerController.getAvailableStores';

import PRODUCT_NAME from '@salesforce/schema/Product2.Name';
import STORE_NAME from '@salesforce/schema/Store__c.Name';

export default class CustomizeReview extends LightningElement {
    // Flow navigation
    @api availableActions = [];

    // Input
    @api selectedFamily = '';

    _selectedProductId = '';
    @api
    get selectedProductId() {
        return this._selectedProductId;
    }
    set selectedProductId(v) {
        this._selectedProductId = v;
        this.isLoadingImage = !!v;
    }

    @api initials = '';
    @api selectedColor = '#ffd900ff';
    @api selectedPosition = 'center-top';

    // Output
    _selectedStoreId = '';
    @api
    get selectedStoreId() {
        return this._selectedStoreId;
    }
    set selectedStoreId(v) {
        this._selectedStoreId = v;
    }

    @track productImageUrl = '';
    @track productName = '';
    @track storeName = '';
    @track stores = [];
    @track isStoreModalOpen = false;
    @track isLoadingImage = false;

    // Product info
    @wire(getRecord, { recordId: '$_selectedProductId', fields: [PRODUCT_NAME] })
    wiredProduct({ data }) {
        this.productName = data ? data.fields.Name.value : '';
    }

    // Product image
    @wire(getProductImage, { productId: '$_selectedProductId' })
    wiredProductImage({ data, error }) {
        if (data) {
            this.productImageUrl = data;
            this.isLoadingImage = false;
        } else if (error) {
            this.productImageUrl = '';
            this.isLoadingImage = false;
        } else {
            this.isLoadingImage = !!this._selectedProductId;
        }
    }

    // Store name
    @wire(getRecord, { recordId: '$_selectedStoreId', fields: [STORE_NAME] })
    wiredStore({ data }) {
        if (data) this.storeName = data.fields.Name.value;
    }

    // Store list
    @wire(getAvailableStores)
    wiredStores({ data, error }) {
        if (data) this.stores = data;
        else if (error) this.stores = [];
    }

    notifyFlow(attributeName, value) {
        this.dispatchEvent(new FlowAttributeChangeEvent(attributeName, value));
    }

    // ----- UI Getters -----
    get hasStoreSelected() {
        return !!(this._selectedStoreId && this._selectedStoreId.length > 0);
    }

    get hasStores() {
        return Array.isArray(this.stores) && this.stores.length > 0;
    }

    get showInitials() {
        return !!(this.initials && this.initials.length > 0);
    }

    get initialsPreview() {
        return (this.initials || '').toUpperCase();
    }

    get initialsDisplay() {
        return this.showInitials ? this.initialsPreview : '-';
    }

    get initialsOverlayClass() {
        return `initials-overlay position-${this.selectedPosition}`;
    }

    get initialsStyle() {
        return `color:${this.selectedColor};`;
    }

    get positionLabel() {
        const positions = { 'center-top': '상단', 'center-bottom': '하단' };
        return positions[this.selectedPosition] || '상단';
    }

    get colorDotStyle() {
        return `background:${this.selectedColor};`;
    }

    get colorLabel() {
        return this.normalizeHex(this.selectedColor).toUpperCase();
    }

    normalizeHex(v) {
        return (v || '').toLowerCase().slice(0, 7);
    }

    // isActive 기반 픽업 가능 표시 (필드 없으면 기본 true)
    get storesVM() {
        const sid = this._selectedStoreId;
        return (this.stores || []).map(s => {
            const hasIsActive =
                Object.prototype.hasOwnProperty.call(s, 'isActive') ||
                Object.prototype.hasOwnProperty.call(s, 'IsActive');

            const raw = (s.isActive !== undefined) ? s.isActive : s.IsActive;
            const canPickup = hasIsActive ? !!raw : true;

            const selected = sid && s.Id === sid;
            const cardClass = selected ? 'store-item selected' : 'store-item';

            return { ...s, canPickup, cardClass };
        });
    }

    // ----- Modal handlers -----
    openStoreModal() {
        this.isStoreModalOpen = true;
    }

    closeStoreModal() {
        this.isStoreModalOpen = false;
    }

    handleStoreClick(event) {
        const storeId = event.currentTarget.dataset.id;
        this._selectedStoreId = storeId;

        const selectedStore = (this.stores || []).find(x => x.Id === storeId);
        if (selectedStore) this.storeName = selectedStore.Name;

        this.notifyFlow('selectedStoreId', this._selectedStoreId);
        this.closeStoreModal();
    }

    // ----- Flow footer (이전/다음·완료) -----
    get disableBack() {
        return !this.availableActions?.includes('BACK');
    }

    get nextFinishLabel() {
        return this.availableActions?.includes('NEXT') ? '다음' : '완료';
    }

    get disableNextFinish() {
        const canNext = this.availableActions?.includes('NEXT');
        const canFinish = this.availableActions?.includes('FINISH');
        // 매장 선택이 필수라면: 선택 안되면 막음
        if (!this.hasStoreSelected) return true;
        return !(canNext || canFinish);
    }

    handleBack() {
        if (!this.availableActions?.includes('BACK')) return;
        // output 확정 전달
        this.notifyFlow('selectedStoreId', this._selectedStoreId);
        setTimeout(() => this.dispatchEvent(new FlowNavigationBackEvent()), 0);
    }

    handleNextOrFinish() {
        const canNext = this.availableActions?.includes('NEXT');
        const canFinish = this.availableActions?.includes('FINISH');
        if (!(canNext || canFinish)) return;

        // 매장 선택 필수
        if (!this.hasStoreSelected) {
            // 여기서는 UI 힌트가 이미 떠 있어서 별도 alert 안 띄움
            return;
        }

        // output 확정 전달
        this.notifyFlow('selectedStoreId', this._selectedStoreId);

        setTimeout(() => {
            if (canNext) this.dispatchEvent(new FlowNavigationNextEvent());
            else this.dispatchEvent(new FlowNavigationFinishEvent());
        }, 0);
    }
}
