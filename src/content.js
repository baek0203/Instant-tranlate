/**
 * content.js - 메인 진입점
 * 각 모듈을 조합하여 드래그 번역 기능 제공
 */

// 중복 초기화 방지
if (window.__translatorInitialized) {
  console.log('Translator already initialized, skipping...');
} else {
  window.__translatorInitialized = true;
  console.log('Initializing translator...');

  // 상태
  let selectedText = '';
  let translatedText = '';
  let dragStartX = 0;
  let dragEndX = 0;
  let currentUILanguage = 'en';

  // 모듈 참조 (manifest.json에서 먼저 로드됨)
  const Button = window.DT_Button;
  const Popup = window.DT_Popup;
  const Translate = window.DT_Translate;
  const Save = window.DT_Save;
  const Deeplink = window.DT_Deeplink;

  /* =========================
     드래그 끝 위치 계산
  ========================= */
  function caretRectFrom(node, offset) {
    if (!node) return null;
    const r = document.createRange();
    try {
      r.setStart(node, offset);
      r.setEnd(node, offset);
    } catch {
      return null;
    }
    const rects = r.getClientRects();
    return rects.length ? rects[0] : null;
  }

  function getDragEndCaretRect() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
    return caretRectFrom(sel.focusNode, sel.focusOffset);
  }

  /* =========================
     버튼 표시/숨김
  ========================= */
  function showButton() {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text) {
      Button.hide();
      return;
    }

    selectedText = text;
    const rect = getDragEndCaretRect();
    if (!rect) {
      Button.hide();
      return;
    }

    const isLTR = dragEndX >= dragStartX;
    Button.show(rect, isLTR);
  }

  /* =========================
     팝업 표시
  ========================= */
  async function showPopup() {
    try {
      if (!chrome.runtime || !chrome.runtime.id) {
        console.error('Extension context invalidated');
        return;
      }

      currentUILanguage = await Translate.getUILanguage();
      const uiTexts = getUILanguage(currentUILanguage);

      await Popup.create(uiTexts);

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      Popup.show(rect);

      // 저장 버튼 핸들러
      Popup.onSave(async () => {
        await handleSave();
      });

      // Google 번역 버튼 핸들러
      Popup.onGoogleWeb(async () => {
        const targetLang = await Translate.getTargetLanguage();
        const url = `https://translate.google.com/?sl=auto&tl=${targetLang}&text=${encodeURIComponent(selectedText)}`;
        window.open(url, '_blank');
      });

    } catch (error) {
      console.error('Error in showPopup:', error);
    }
  }

  /* =========================
     번역 처리
  ========================= */
  async function translate(text) {
    const uiTexts = getUILanguage(currentUILanguage);
    Popup.setTranslation(uiTexts.translating);

    try {
      const targetLang = await Translate.getTargetLanguage();
      const res = await Translate.request(text, targetLang);

      if (res?.success) {
        translatedText = res.translatedText;
        Popup.setTranslation(translatedText);
      } else {
        translatedText = '';
        Popup.setTranslation(uiTexts.translationFailed || 'Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      translatedText = '';

      if (error.message?.includes('Extension context invalidated')) {
        Popup.setTranslation('Please reload the page (F5)');
      } else if (error.message === 'Translation timeout') {
        Popup.setTranslation(uiTexts.translationTimeout || 'Translation timeout');
      } else {
        Popup.setTranslation(uiTexts.errorOccurred || 'An error occurred');
      }
    }
  }

  /* =========================
     저장 처리
  ========================= */
  async function handleSave() {
    if (!selectedText || !translatedText) {
      alert(chrome.i18n.getMessage('noTranslationToSave'));
      return;
    }

    try {
      const selectionInfo = Save.getSelectionInfo();
      await Save.saveTranslation(selectedText, translatedText, selectionInfo);

      const originalBtnText = Popup.element?.querySelector('#save-translation')?.textContent;
      Popup.setSaveButtonState(chrome.i18n.getMessage('saved'), true);

      setTimeout(() => {
        Popup.setSaveButtonState(originalBtnText, false);
      }, 2000);

    } catch (error) {
      console.error('Save failed:', error);
      if (error.message?.includes('Extension context invalidated')) {
        alert('Extension context invalidated. Please reload the page (F5)');
      } else {
        alert(chrome.i18n.getMessage('saveFailed'));
      }
    }
  }

  /* =========================
     버튼 클릭 핸들러
  ========================= */
  Button.onClick(async () => {
    if (!selectedText) return;

    await showPopup();
    await new Promise(resolve => setTimeout(resolve, 50));
    await translate(selectedText);
    Button.hide();
  });

  /* =========================
     이벤트 리스너
  ========================= */
  document.addEventListener('mousedown', e => {
    dragStartX = e.pageX;

    // 팝업 외부 클릭 시 닫기
    if (
      Popup.isVisible() &&
      !e.target.closest('.translator-popup') &&
      !e.target.closest('.translator-action-btn')
    ) {
      Popup.hide();
    }
  });

  document.addEventListener('mouseup', e => {
    dragEndX = e.pageX;

    if (
      e.target.closest('.translator-action-btn') ||
      e.target.closest('.translator-popup')
    ) return;

    setTimeout(showButton, 10);
  });

  document.addEventListener('mousemove', e => {
    if (!Button.element || Button.element.style.display === 'none') return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    if (e.target.closest('.translator-action-btn')) {
      Button.resetHideTimer(3000);
      return;
    }

    const range = sel.getRangeAt(0);
    const rects = range.getClientRects();

    let isOverSelection = false;
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        isOverSelection = true;
        break;
      }
    }

    if (isOverSelection) {
      Button.setOpacity('1');
      Button.resetHideTimer(3000);
    } else {
      Button.setOpacity('');
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      Button.hide();
      Popup.hide();
      window.getSelection()?.removeAllRanges();
    }
  });

  document.addEventListener('scroll', () => {
    if (!Button.element || Button.element.style.display === 'none') return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const rect = getDragEndCaretRect();
    if (!rect) return;

    const isLTR = dragEndX >= dragStartX;
    Button.updatePosition(rect, isLTR);
  }, true);

  /* =========================
     딥링크 처리
  ========================= */
  Deeplink.scrollToSavedTranslation();

} // end of if (!window.__translatorInitialized)
