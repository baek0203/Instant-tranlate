/**
 * popup.js - 번역 팝업 UI 모듈
 */

const Popup = {
  element: null,

  /**
   * 팝업 생성 또는 업데이트
   */
  async create(uiTexts) {
    if (!this.element) {
      const p = document.createElement('div');
      p.className = 'translator-popup';
      p.style.display = 'none';
      p.innerHTML = `
        <div class="popup-header">
          <span id="popup-title">${uiTexts.translation}</span>
          <button class="close-x">✕</button>
        </div>
        <div class="popup-content" id="translated-text">${uiTexts.translating}</div>
        <div class="popup-footer">
          <button id="save-translation">${uiTexts.save}</button>
          <button id="go-google-web">${uiTexts.viewAllTranslations}</button>
        </div>
      `;

      p.querySelector('.close-x').onclick = () => this.hide();

      document.body.appendChild(p);
      this.element = p;
    } else {
      this.updateTexts(uiTexts);
    }

    return this.element;
  },

  /**
   * UI 텍스트 업데이트
   */
  updateTexts(uiTexts) {
    if (!this.element) return;

    const popupTitle = this.element.querySelector('#popup-title');
    const saveBtn = this.element.querySelector('#save-translation');
    const viewAllBtn = this.element.querySelector('#go-google-web');
    const translatingText = this.element.querySelector('#translated-text');

    if (popupTitle) popupTitle.textContent = uiTexts.translation;
    if (saveBtn) saveBtn.textContent = uiTexts.save;
    if (viewAllBtn) viewAllBtn.textContent = uiTexts.viewAllTranslations;
    if (translatingText) translatingText.textContent = uiTexts.translating;
  },

  /**
   * 팝업 표시
   */
  show(rect) {
    if (!this.element) return;

    this.element.style.left = `${rect.left + window.scrollX}px`;
    this.element.style.top = `${rect.bottom + window.scrollY + 10}px`;
    this.element.style.display = 'block';
  },

  /**
   * 팝업 숨기기
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  },

  /**
   * 번역 결과 표시
   */
  setTranslation(text) {
    const el = this.element?.querySelector('#translated-text');
    if (el) {
      el.textContent = text;
    }
  },

  /**
   * 저장 버튼 핸들러 설정
   */
  onSave(handler) {
    const btn = this.element?.querySelector('#save-translation');
    if (btn) {
      btn.onclick = handler;
    }
  },

  /**
   * Google 번역 버튼 핸들러 설정
   */
  onGoogleWeb(handler) {
    const btn = this.element?.querySelector('#go-google-web');
    if (btn) {
      btn.onclick = handler;
    }
  },

  /**
   * 저장 버튼 상태 업데이트
   */
  setSaveButtonState(text, disabled) {
    const btn = this.element?.querySelector('#save-translation');
    if (btn) {
      btn.textContent = text;
      btn.disabled = disabled;
    }
  },

  /**
   * 팝업이 표시중인지 확인
   */
  isVisible() {
    return this.element && this.element.style.display !== 'none';
  }
};

window.DT_Popup = Popup;
