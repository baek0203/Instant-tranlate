/**
 * save.js - 번역 저장 모듈
 * 번역 결과를 Chrome storage에 저장
 */

const Save = {
  /**
   * 현재 선택 영역 정보 가져오기
   */
  getSelectionInfo() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;

    const range = sel.getRangeAt(0);
    const nodes = window.DT_Highlight.getTextNodes(document.body);
    let index = 0;

    for (const node of nodes) {
      if (node === range.startContainer) {
        index += range.startOffset;
        return {
          startIndex: index,
          length: range.toString().length
        };
      }
      index += node.nodeValue.length;
    }

    return null;
  },

  /**
   * 번역 저장
   */
  async saveTranslation(originalText, translatedText, selectionInfo) {
    if (!originalText || !translatedText) {
      throw new Error('No translation to save');
    }

    if (!chrome.runtime || !chrome.runtime.id) {
      throw new Error('Extension context invalidated');
    }

    const newEntry = {
      id: Date.now(),
      original: originalText,
      translated: translatedText,
      pageUrl: window.location.href,
      pageTitle: document.title,
      selectionStart: selectionInfo?.startIndex ?? null,
      selectionLength: selectionInfo?.length ?? null,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString()
    };

    const result = await chrome.storage.local.get(['translations']);
    const translations = result.translations || [];

    translations.unshift(newEntry);

    if (translations.length > 100) {
      translations.pop();
    }

    await chrome.storage.local.set({ translations });

    return newEntry;
  }
};

window.DT_Save = Save;
