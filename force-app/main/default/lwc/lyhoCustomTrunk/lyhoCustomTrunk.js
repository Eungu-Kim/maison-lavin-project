import { LightningElement } from 'lwc';
import HERO_IMG from '@salesforce/resourceUrl/largeCareBG';
import CAT_HANDBAG from '@salesforce/resourceUrl/cat_handbag';
import CAT_WALLET  from '@salesforce/resourceUrl/cat_wallet';
import CAT_TRAVEL  from '@salesforce/resourceUrl/cat_travel';
import CAT_JEWELRY from '@salesforce/resourceUrl/cat_jewelry';
import CAT_PERFUME from '@salesforce/resourceUrl/cat_perfume';
import PROD_NEVERFULL from '@salesforce/resourceUrl/prod_neverfull_mm';
import PROD_KEEPALL50 from '@salesforce/resourceUrl/prod_keepall_50';
import PROD_HORIZON55 from '@salesforce/resourceUrl/prod_horizon_55';
import PROD_SPEEDY25  from '@salesforce/resourceUrl/prod_speedy_25';
import PROD_POCKETORG from '@salesforce/resourceUrl/prod_pocket_organizer';
import PROD_ONTHEGO   from '@salesforce/resourceUrl/prod_onthego_gm';

export default class MaisonLavinCare extends LightningElement {
  // === 데이터 ===
  products = [
    { name: "네버풀 MM", tag: "PERSONALIZATION" },
    { name: "키폴 반둘리에 50", tag: "PERSONALIZATION" },
    { name: "호라이즌 55", tag: "PERSONALIZATION" },
    { name: "스피디 반둘리에 25", tag: "PERSONALIZATION" },
    { name: "포켓 오거나이저", tag: "PERSONALIZATION" },
    { name: "온더고 GM", tag: "PERSONALIZATION" }
  ];

  // === 설정 ===
  cloneSetCount = 3;   // 3세트 복제
  VISIBLE_COUNT = 5;   // 처음에 5개 보이게
  EDGE_CUT = 460;      // 값↑ = 카드폭↑, 양끝 더 잘림
  ITEM_GAP = 7;        // 카드 사이 간격(px)

  // === 내부 상태 ===
  cardW = 0;
  gapW = this.ITEM_GAP;
  slideW = 0;

  scrollFixTimer = null;
  isFixing = false;

  _initialized = false;

  // refs
  trackEl;
  containerEl;
  btnPrevEl;
  btnNextEl;

  // bound handlers (remove용)
  _boundGoPrev;
  _boundGoNext;
  _boundOnScroll;
  _boundOnResize;

  renderedCallback() {
    if (this._initialized) return;

    // ✅ LWC 권장: lwc:ref + this.refs로 요소 접근 :contentReference[oaicite:2]{index=2}
    this.trackEl = this.refs.track;
    this.containerEl = this.refs.sliderContainer;
    this.btnPrevEl = this.refs.btnPrev;
    this.btnNextEl = this.refs.btnNext;

    // 필수 요소가 없으면 크래시 방지
    if (!this.trackEl || !this.containerEl || !this.btnPrevEl || !this.btnNextEl) return;

    // 핸들러 바인딩
    this._boundGoPrev = this.goPrev.bind(this);
    this._boundGoNext = this.goNext.bind(this);
    this._boundOnScroll = this.onScroll.bind(this);
    this._boundOnResize = this.onResize.bind(this);

    // 이벤트 연결
    this.btnPrevEl.addEventListener('click', this._boundGoPrev);
    this.btnNextEl.addEventListener('click', this._boundGoNext);
    this.containerEl.addEventListener('scroll', this._boundOnScroll, { passive: true });
    window.addEventListener('resize', this._boundOnResize);

    // 초기 렌더 로직
    this.renderTrack();
    this.applyLayoutVars();

    requestAnimationFrame(() => {
      if (!this.measure()) return;
      requestAnimationFrame(() => this.setInitialPosition());
    });


    const el = this.template.querySelector('.after-media__img');
  if (!el) return;

    el.style.backgroundImage = `url(${HERO_IMG})`;
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundPosition = 'center';
    this._initialized = true;

// 카테고리 5개 placeholder에 이미지 주입 (템플릿 변경 없음)
const catImgs = [CAT_HANDBAG, CAT_WALLET, CAT_TRAVEL, CAT_JEWELRY, CAT_PERFUME];
const catEls = this.template.querySelectorAll('.main-vv__cat-placeholder');

catEls.forEach((el, i) => {
  const src = catImgs[i];
  if (!src) return;

  el.style.backgroundImage = `url(${src})`;
  el.style.backgroundSize = 'cover';       // 아이콘/로고면 'contain' 추천
  el.style.backgroundPosition = 'center';
  el.style.backgroundRepeat = 'no-repeat';
});


  }

  disconnectedCallback() {
    if (this.btnPrevEl && this._boundGoPrev) this.btnPrevEl.removeEventListener('click', this._boundGoPrev);
    if (this.btnNextEl && this._boundGoNext) this.btnNextEl.removeEventListener('click', this._boundGoNext);
    if (this.containerEl && this._boundOnScroll) this.containerEl.removeEventListener('scroll', this._boundOnScroll);
    if (this._boundOnResize) window.removeEventListener('resize', this._boundOnResize);

    if (this.scrollFixTimer) {
      clearTimeout(this.scrollFixTimer);
      this.scrollFixTimer = null;
    }
  }

  setScrollLeft(left, behavior = 'auto') {
    try { this.containerEl.scrollTo({ left, behavior }); }
    catch (e) { this.containerEl.scrollLeft = left; }
  }

  createCard(product) {
    const card = document.createElement('div');
    card.className = 'prod-card';

    const imgBox = document.createElement('div');
    imgBox.className = 'prod-img-box';

    const imgMap = {
      "네버풀 MM": PROD_NEVERFULL,
      "키폴 반둘리에 50": PROD_KEEPALL50,
      "호라이즌 55": PROD_HORIZON55,
      "스피디 반둘리에 25": PROD_SPEEDY25,
      "포켓 오거나이저": PROD_POCKETORG,
      "온더고 GM": PROD_ONTHEGO
    };
  
    const src = imgMap[product.name];
    if (src) {
      imgBox.style.backgroundImage = `url(${src})`;
      imgBox.style.backgroundSize = 'cover';     // 필요시 contain
      imgBox.style.backgroundPosition = 'center';
      imgBox.style.backgroundRepeat = 'no-repeat';
    }
  

    const info = document.createElement('div');
    info.className = 'prod-info';

    const tag = document.createElement('span');
    tag.className = 'prod-tag';
    tag.textContent = product.tag;

    const name = document.createElement('h3');
    name.className = 'prod-name';
    name.textContent = product.name;

    info.appendChild(tag);
    info.appendChild(name);

    card.appendChild(imgBox);
    card.appendChild(info);

    return card;






  }

  renderTrack() {
    // 기존 DOM 제거
    while (this.trackEl.firstChild) {
      this.trackEl.removeChild(this.trackEl.firstChild);
    }

    for (let i = 0; i < this.cloneSetCount; i++) {
      this.products.forEach(p => this.trackEl.appendChild(this.createCard(p)));
    }
  }

  applyLayoutVars() {
    const containerW = this.containerEl.clientWidth;

    const computedCardW = Math.max(
      260,
      Math.round((containerW + (this.EDGE_CUT * 2) - ((this.VISIBLE_COUNT - 1) * this.ITEM_GAP)) / this.VISIBLE_COUNT)
    );

    this.containerEl.style.setProperty('--card-w', `${computedCardW}px`);
    this.containerEl.style.setProperty('--card-gap', `${this.ITEM_GAP}px`);
  }

  measure() {
    const first = this.trackEl.querySelector('.prod-card');
    if (!first) return false;

    this.cardW = first.getBoundingClientRect().width;

    const cs = getComputedStyle(this.trackEl);
    const gap = cs.gap || cs.columnGap || `${this.ITEM_GAP}px`;
    this.gapW = parseFloat(gap) || this.ITEM_GAP;

    this.slideW = this.cardW + this.gapW;
    return this.slideW > 0;
  }

  scrollToCard(index, behavior = 'auto') {
    const el = this.trackEl.children[index];
    if (!el) return;

    const elW = el.getBoundingClientRect().width;
    const desired = Math.round(el.offsetLeft - (this.containerEl.clientWidth - elW) / 2);
    this.setScrollLeft(desired, behavior);
  }

  getNearestIndex() {
    if (!this.slideW) return 0;

    const centerX = this.containerEl.scrollLeft + this.containerEl.clientWidth / 2;
    const approx = Math.round((centerX - this.cardW / 2) / this.slideW);

    let best = Math.max(0, Math.min(this.trackEl.children.length - 1, approx));
    let bestDist = Infinity;

    for (let i = approx - 2; i <= approx + 2; i++) {
      if (i < 0 || i >= this.trackEl.children.length) continue;
      const el = this.trackEl.children[i];
      const elCenter = el.offsetLeft + el.getBoundingClientRect().width / 2;
      const dist = Math.abs(elCenter - centerX);
      if (dist < bestDist) { bestDist = dist; best = i; }
    }
    return best;
  }

  setInitialPosition() {
    const len = this.products.length;
    const middleSetBaseIndex = len;
    const centerIndexInView = 2;
    this.scrollToCard(middleSetBaseIndex + centerIndexInView, 'auto');
  }

  goBy(delta) {
    if (!this.slideW) return;

    const len = this.products.length;
    const idx = this.getNearestIndex();
    const within = ((idx % len) + len) % len;
    const nextWithin = (within + delta + len) % len;
    const target = len + nextWithin;

    this.scrollToCard(target, 'smooth');
  }

  goPrev() { this.goBy(-1); }
  goNext() { this.goBy(1); }

  onScroll() {
    if (this.isFixing || !this.slideW) return;

    if (this.scrollFixTimer) clearTimeout(this.scrollFixTimer);
    this.scrollFixTimer = setTimeout(() => {
      const len = this.products.length;
      const idx = this.getNearestIndex();
      const within = ((idx % len) + len) % len;
      const target = len + within;

      if (target === idx) return;

      this.isFixing = true;
      this.scrollToCard(target, 'auto');
      requestAnimationFrame(() => { this.isFixing = false; });
    }, 160);
  }

  onResize() {
    const len = this.products.length;

    let within = 2;
    if (this.slideW) {
      const idx = this.getNearestIndex();
      within = ((idx % len) + len) % len;
    }

    this.applyLayoutVars();
    requestAnimationFrame(() => {
      if (!this.measure()) return;
      this.scrollToCard(len + within, 'auto');
    });
  }
}