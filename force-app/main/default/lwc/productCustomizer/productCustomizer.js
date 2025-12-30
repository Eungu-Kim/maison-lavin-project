import { LightningElement, api, track, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

import {
    FlowAttributeChangeEvent,
    FlowNavigationBackEvent,
    FlowNavigationNextEvent,
    FlowNavigationFinishEvent
} from 'lightning/flowSupport';

import getProductImage from '@salesforce/apex/ProductCustomizerController.getProductImage';
import getProductFamilies from '@salesforce/apex/ProductCustomizerController.getProductFamilies';

const PRODUCT_FIELDS = ['Product2.Name'];

/**
 * 제품 선택 전 기본 프리뷰용 SVG (배경 톤과 어울리게)
 * - 별도 파일/리소스 없이 바로 동작
 * - 원하면 Flow에서 defaultPreviewImageUrl로 교체 가능
 */
const FALLBACK_PREVIEW_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 720 900">
  <defs>
    <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#fbfbfb"/>
      <stop offset="0.55" stop-color="#f2f2f2"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="rgba(0,0,0,0.22)"/>
      <stop offset="0.7" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
  </defs>

  <rect width="720" height="900" fill="url(#bg)"/>
  <!-- 바닥 그림자 -->
  <ellipse cx="360" cy="690" rx="210" ry="42" fill="url(#shadow)" opacity="0.55"/>

  <!-- 심플한 캐리어 실루엣 -->
  <g opacity="0.88">
    <rect x="260" y="190" width="200" height="470" rx="22" fill="#e6e6e6" stroke="#d2d2d2"/>
    <rect x="295" y="130" width="130" height="90" rx="18" fill="#ededed" stroke="#d2d2d2"/>
    <rect x="330" y="110" width="60" height="40" rx="14" fill="#f2f2f2" stroke="#d2d2d2"/>
    <circle cx="285" cy="675" r="18" fill="#d9d9d9" stroke="#c8c8c8"/>
    <circle cx="435" cy="675" r="18" fill="#d9d9d9" stroke="#c8c8c8"/>
  </g>

  <text x="360" y="790" text-anchor="middle"
        font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial"
        font-size="20" fill="#888">
    제품을 선택하면 미리보기가 표시됩니다
  </text>
</svg>
`)}`;

export default class ProductCustomizer extends LightningElement {
    // Flow I/O
    @api selectedFamily = '';
    @api selectedProductId = '';
    @api selectedColor = '#ffd900ff';
    @api selectedPosition = 'center-top';
    @api initials = '';

    // 제품 선택 전 기본 이미지 URL(선택)
    @api defaultPreviewImageUrl = '';

    // Flow navigation
    @api availableActions = [];

    // LWC1503 회피: @api Boolean true 초기화 금지
    _useCustomFooter;
    @api
    get useCustomFooter() {
        return this._useCustomFooter ?? true;
    }
    set useCustomFooter(value) {
        this._useCustomFooter = this.coerceBoolean(value);
    }

    coerceBoolean(v) {
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') return v.toLowerCase() === 'true';
        return false;
    }

    @track categoryOptions = [];
    @track productImageUrl = '';
    @track isLoadingImage = false;

    // 옵션 토글: 이니셜 기본 OFF
    @track optInitials = false;
    @track optPatch = false;
    @track optEmbroidery = false;
    @track optStud = false;

    // validation state
    @track internalError = '';
    @track externalError = '';
    @track showErrors = false;

    // ---------- Data ----------
    @wire(getProductFamilies)
    wiredFamilies({ data, error }) {
        if (data) this.categoryOptions = data;
        else if (error) {
            this.categoryOptions = [
                { label: '트래블', value: 'Travel' },
                { label: '비즈니스', value: 'Business' }
            ];
        }
    }

    @wire(getRecord, { recordId: '$selectedProductId', fields: PRODUCT_FIELDS })
    productRecord;

    get productName() {
        return this.productRecord?.data?.fields?.Name?.value || '';
    }

    // ---------- Preview ----------
    get previewImageUrl() {
        // 제품 이미지 > Flow에서 준 기본 이미지 > 내장 SVG
        return this.productImageUrl || this.defaultPreviewImageUrl || '';
    }

    // ---------- Record Picker Filter ----------
    get productFilter() {
        const criteria = [];
        if (this.selectedFamily) {
            criteria.push({ fieldPath: 'Family', operator: 'eq', value: this.selectedFamily });
        }
        return { criteria };
    }

    // ---------- UI computed ----------
    get showErrorBanner() {
        return this.showErrors && (!!this.externalError || !!this.internalError);
    }

    get isInitialsActive() { return this.optInitials; }
    get isPatchActive() { return this.optPatch; }
    get isEmbroideryActive() { return this.optEmbroidery; }
    get isStudActive() { return this.optStud; }

    get disableBack() {
        return !this.availableActions?.includes('BACK');
    }

    get disableNextFinish() {
        const canNext = this.availableActions?.includes('NEXT');
        const canFinish = this.availableActions?.includes('FINISH');
        return !(canNext || canFinish);
    }

    get nextFinishLabel() {
        return this.availableActions?.includes('NEXT') ? '다음' : '완료';
    }

    get isPosTop() { return this.selectedPosition === 'center-top'; }
    get isPosBottom() { return this.selectedPosition === 'center-bottom'; }

    // initials preview
    get showInitials() {
        return this.optInitials && this.initials && this.initials.length > 0;
    }

    get initialsPreview() {
        return (this.initials || '').toUpperCase();
    }

    get initialsOverlayClass() {
        return `initials-overlay position-${this.selectedPosition}`;
    }

    // 크기 고정(옵션 제거)
    get initialsStyle() {
        return `color:${this.selectedColor}; font-size:24px;`;
    }

    // Swatches
    get selectedColorLabel() {
        const found = this.colorPaletteRaw.find(x => this.normalizeHex(x.value) === this.normalizeHex(this.selectedColor));
        return found ? found.label : '색상을 선택하세요';
    }

    get colorPaletteRaw() {
        return [
            { label: '화이트', value: '#ffffff' },
            { label: '라이트 그레이', value: '#cfd2d6' },
            { label: '블루', value: '#1f6feb' },
            { label: '네이비', value: '#0b1f4b' },
            { label: '베이지', value: '#c8a47e' },
            { label: '브라운', value: '#6a3d1a' },
            { label: '퍼플', value: '#7a2cff' },
            { label: '블랙', value: '#111111' },
            { label: '오렌지', value: '#f26b1d' },
            { label: '레드', value: '#d92d20' },
            { label: '사프란 옐로우', value: '#ffd900' }
        ];
    }

    get colorPalette() {
        return this.colorPaletteRaw.map(p => ({
            ...p,
            selected: this.normalizeHex(this.selectedColor) === this.normalizeHex(p.value),
            style: `background:${p.value};`
        }));
    }

    normalizeHex(v) {
        return (v || '').toLowerCase().slice(0, 7);
    }

    // ---------- Handlers ----------
    handleCategoryChange(event) {
        this.selectedFamily = event.detail.value;
        this.selectedProductId = '';
        this.productImageUrl = '';
        this.commitToFlow();
        this.clearErrors();
    }

    handleProductSelect(event) {
        this.selectedProductId = event.detail.recordId || '';
        this.clearErrors();
        this.commitToFlow();
        this.loadProductImage();
    }

    loadProductImage() {
        if (!this.selectedProductId) {
            this.productImageUrl = '';
            return;
        }
        this.isLoadingImage = true;
        getProductImage({ productId: this.selectedProductId })
            .then(url => { this.productImageUrl = url || ''; })
            .catch(() => { this.productImageUrl = ''; })
            .finally(() => { this.isLoadingImage = false; });
    }

    toggleOption(event) {
        const key = event.currentTarget.dataset.key;
        if (key === 'initials') this.optInitials = !this.optInitials;
        if (key === 'patch') this.optPatch = !this.optPatch;
        if (key === 'embroidery') this.optEmbroidery = !this.optEmbroidery;
        if (key === 'stud') this.optStud = !this.optStud;

        if (!this.optInitials) {
            this.initials = '';
            this.commitToFlow();
        }
        this.clearErrors();
    }

    handleInitialsChange(event) {
        this.initials = (event.detail.value || '').toUpperCase();
        this.commitToFlow();
        this.clearErrors();
    }

    handleColorSwatch(event) {
        this.selectedColor = event.currentTarget.dataset.color;
        this.commitToFlow();
        this.clearErrors();
    }

    handlePositionButton(event) {
        this.selectedPosition = event.currentTarget.dataset.value;
        this.commitToFlow();
        this.clearErrors();
    }

    scrollSwatchesLeft() {
        const rail = this.template.querySelector('[data-id="swatchRail"]');
        if (!rail) return;
        rail.scrollLeft -= 180;
    }

    scrollSwatchesRight() {
        const rail = this.template.querySelector('[data-id="swatchRail"]');
        if (!rail) return;
        rail.scrollLeft += 180;
    }

    handleReset() {
        this.selectedFamily = '';
        this.selectedProductId = '';
        this.productImageUrl = '';

        this.optInitials = false;
        this.optPatch = false;
        this.optEmbroidery = false;
        this.optStud = false;

        this.initials = '';
        this.selectedColor = '#ffd900ff';
        this.selectedPosition = 'center-top';

        this.commitToFlow();
        this.clearErrors();
    }

    // ---------- Flow integration ----------
    commitToFlow() {
        this.dispatchEvent(new FlowAttributeChangeEvent('selectedFamily', this.selectedFamily));
        this.dispatchEvent(new FlowAttributeChangeEvent('selectedProductId', this.selectedProductId));
        this.dispatchEvent(new FlowAttributeChangeEvent('initials', this.initials));
        this.dispatchEvent(new FlowAttributeChangeEvent('selectedColor', this.selectedColor));
        this.dispatchEvent(new FlowAttributeChangeEvent('selectedPosition', this.selectedPosition));
    }

    // ---------- Validation ----------
    @api validate() {
        const ok = this.checkValidityInternal();
        return ok ? { isValid: true } : { isValid: false, errorMessage: '필수 항목(카테고리/제품)을 확인하세요.' };
    }

    @api reportValidity() {
        this.showErrors = true;
        if (!this.externalError) this.checkValidityInternal();
        return this.checkValidityInternal();
    }

    @api setCustomValidity(externalErrorMessage) {
        this.externalError = externalErrorMessage || '';
    }

    checkValidityInternal() {
        if (this.externalError) { this.internalError = ''; return false; }
        if (!this.selectedFamily) { this.internalError = '카테고리를 선택하세요.'; return false; }
        if (!this.selectedProductId) { this.internalError = '제품을 선택하세요.'; return false; }
        this.internalError = '';
        return true;
    }

    clearErrors() {
        this.internalError = '';
        this.externalError = '';
        this.showErrors = false;
    }

    // ---------- Navigation ----------
    handleBack() {
        if (!this.availableActions?.includes('BACK')) return;
        this.commitToFlow();
        setTimeout(() => this.dispatchEvent(new FlowNavigationBackEvent()), 0);
    }

    handleNextOrFinish() {
        const canNext = this.availableActions?.includes('NEXT');
        const canFinish = this.availableActions?.includes('FINISH');
        if (!(canNext || canFinish)) return;

        if (!this.checkValidityInternal()) { this.showErrors = true; return; }

        this.commitToFlow();
        setTimeout(() => {
            if (canNext) this.dispatchEvent(new FlowNavigationNextEvent());
            else this.dispatchEvent(new FlowNavigationFinishEvent());
        }, 0);
    }
}
