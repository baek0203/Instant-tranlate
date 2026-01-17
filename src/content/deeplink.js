/**
 * deeplink.js - 딥링크 모듈
 * URL hash를 통한 저장된 번역 위치로 이동 및 하이라이트
 */

const Deeplink = {
  /**
   * URL에서 딥링크 ID 추출
   */
  getId() {
    const hash = window.location.hash || '';
    if (!hash.includes('dt-id=')) return null;
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    return params.get('dt-id');
  },

  /**
   * 저장된 번역 위치로 스크롤 및 하이라이트
   */
  async scrollToSavedTranslation() {
    const entryId = this.getId();
    if (!entryId) return;

    try {
      const result = await chrome.storage.local.get(['translations']);
      const translations = result.translations || [];
      const entry = translations.find(item => item.id.toString() === entryId);
      if (!entry || !entry.original) return;

      // 페이지 로드 완료 대기
      await new Promise(resolve => setTimeout(resolve, 500));

      // window.find() API를 사용하여 텍스트 검색
      if (window.DT_Highlight.findAndHighlight(entry.original)) {
        return;
      }

      // 폴백: 인덱스 기반 검색
      if (entry.selectionStart !== null && entry.selectionLength !== null) {
        const range = window.DT_Highlight.createRangeFromTextIndex(
          entry.selectionStart,
          entry.selectionLength
        );
        if (window.DT_Highlight.addTemporary(range)) {
          return;
        }
      }

      console.warn('Could not find text to highlight:', entry.original.substring(0, 50));
    } catch (error) {
      console.error('Failed to load translation for deep link:', error);
    }
  }
};

window.DT_Deeplink = Deeplink;
