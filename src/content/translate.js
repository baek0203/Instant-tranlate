/**
 * translate.js - 번역 모듈
 * Chrome runtime을 통한 번역 요청 처리
 */

const Translate = {
  /**
   * 텍스트 번역 요청
   */
  async request(text, targetLang) {
    if (!chrome.runtime || !chrome.runtime.id) {
      throw new Error('Extension context invalidated');
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Translation timeout')), 15000);
    });

    const translationPromise = chrome.runtime.sendMessage({
      action: 'translate',
      text,
      targetLang
    });

    return Promise.race([translationPromise, timeoutPromise]);
  },

  /**
   * 설정에서 목표 언어 가져오기
   */
  async getTargetLanguage() {
    const settings = await chrome.storage.sync.get(['targetLanguage']);
    return settings.targetLanguage || 'ko';
  },

  /**
   * UI 언어 가져오기
   */
  async getUILanguage() {
    const settings = await chrome.storage.sync.get(['uiLanguage', 'targetLanguage']);
    return settings.uiLanguage || settings.targetLanguage || 'en';
  }
};

window.DT_Translate = Translate;
