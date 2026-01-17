/**
 * button.js - 번역 버튼 UI 모듈
 */

const Button = {
  element: null,
  hideTimer: null,

  /**
   * 버튼 생성 또는 반환
   */
  get() {
    if (this.element) return this.element;

    const btn = document.createElement('div');
    btn.className = 'translator-action-btn';
    btn.style.display = 'none';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94
          2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17
          C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19
          6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09
          5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12
          22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33
          L19.12 17h-3.24z" fill="#4285F4"/>
      </svg>
    `;

    btn.onmousedown = e => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.body.appendChild(btn);
    this.element = btn;
    return btn;
  },

  /**
   * 버튼 표시
   */
  show(rect, isLTR) {
    const btn = this.get();
    const btnW = 30;
    const btnH = 28;
    const gap = 8;

    const x = isLTR
      ? rect.right + window.scrollX + gap
      : rect.left + window.scrollX - btnW - gap;

    const y = rect.top + window.scrollY + rect.height / 2 - btnH / 2;

    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
    btn.style.display = 'flex';

    this.resetHideTimer();
  },

  /**
   * 버튼 숨기기
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
    this.clearHideTimer();
  },

  /**
   * 자동 숨김 타이머 설정
   */
  resetHideTimer(delay = 5000) {
    this.clearHideTimer();
    this.hideTimer = setTimeout(() => this.hide(), delay);
  },

  /**
   * 타이머 해제
   */
  clearHideTimer() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  },

  /**
   * 클릭 핸들러 설정
   */
  onClick(handler) {
    const btn = this.get();
    btn.onclick = async e => {
      e.preventDefault();
      e.stopPropagation();
      await handler(e);
    };
  },

  /**
   * 위치 업데이트
   */
  updatePosition(rect, isLTR) {
    if (!this.element || this.element.style.display === 'none') return;

    const btnW = 30;
    const btnH = 28;
    const gap = 8;

    const x = isLTR
      ? rect.right + window.scrollX + gap
      : rect.left + window.scrollX - btnW - gap;

    const y = rect.top + window.scrollY + rect.height / 2 - btnH / 2;

    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  },

  /**
   * 버튼 불투명도 설정
   */
  setOpacity(value) {
    if (this.element) {
      this.element.style.opacity = value;
    }
  }
};

window.DT_Button = Button;
