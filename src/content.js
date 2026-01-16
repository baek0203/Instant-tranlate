// 이미 초기화되었는지 확인
if (window.__translatorInitialized) {
  console.log('Translator already initialized, skipping...');
} else {
  window.__translatorInitialized = true;
  console.log('Initializing translator...');

let translateButton = null;
let translationPopup = null;
let selectedText = '';
let translatedText = '';

let dragStartX = 0;
let dragEndX = 0;

let hideButtonTimer = null;
let currentUILanguage = 'en';

/* =========================
   버튼 생성
========================= */
function getButton() {
  if (translateButton) return translateButton;

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

  btn.onclick = async e => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedText) return;

    await showPopup();
    // 팝업이 DOM에 추가될 때까지 짧은 대기
    await new Promise(resolve => setTimeout(resolve, 50));
    await translate(selectedText);
    hideButton();
  };

  document.body.appendChild(btn);
  translateButton = btn;
  return btn;
}

/* =========================
   caret rect (드래그 끝 기준)
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

  // ✅ 드래그가 끝난 지점 = focus
  return caretRectFrom(sel.focusNode, sel.focusOffset);
}

/* =========================
   버튼 표시
========================= */
function showButton() {
  const sel = window.getSelection();
  const text = sel?.toString().trim();
  if (!text) return hideButton();

  selectedText = text;

  const rect = getDragEndCaretRect();
  if (!rect) return hideButton();

  const btn = getButton();
  const btnW = 30;
  const btnH = 28;
  const gap = 8;

  // 드래그 방향
  const isLTR = dragEndX >= dragStartX;

  // ✅ "끝나는 지점의 바깥쪽"
  const x = isLTR
    ? rect.right + window.scrollX + gap
    : rect.left + window.scrollX - btnW - gap;

  const y =
    rect.top +
    window.scrollY +
    rect.height / 2 -
    btnH / 2;

  btn.style.left = `${x}px`;
  btn.style.top = `${y}px`;
  btn.style.display = 'flex';

  // 자동 숨김 타이머 설정 (5초 후)
  clearTimeout(hideButtonTimer);
  hideButtonTimer = setTimeout(() => {
    hideButton();
  }, 5000);
}

function hideButton() {
  if (translateButton) translateButton.style.display = 'none';
  clearTimeout(hideButtonTimer);
}

/* =========================
   팝업
========================= */
async function showPopup() {
  let uiTexts;

  try {
    // chrome.runtime이 유효한지 확인
    if (!chrome.runtime || !chrome.runtime.id) {
      console.error('Extension context invalidated');
      return;
    }

    // UI 언어 가져오기
    const settings = await chrome.storage.sync.get(['uiLanguage', 'targetLanguage']);
    currentUILanguage = settings.uiLanguage || settings.targetLanguage || 'en';
    uiTexts = getUILanguage(currentUILanguage);
  } catch (error) {
    console.error('Error in showPopup:', error);
    return;
  }

  if (!translationPopup) {
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
    p.querySelector('.close-x').onclick = hidePopup;
    p.querySelector('#go-google-web').onclick = async () => {
      const settings = await chrome.storage.sync.get(['targetLanguage']);
      const targetLang = settings.targetLanguage || 'ko';
      const url = `https://translate.google.com/?sl=auto&tl=${targetLang}&text=${encodeURIComponent(selectedText)}`;
      window.open(url, '_blank');
    };
    p.querySelector('#save-translation').onclick = saveTranslation;

    document.body.appendChild(p);
    translationPopup = p;
  } else {
    // 팝업이 이미 있으면 텍스트만 업데이트
    const popupTitle = translationPopup.querySelector('#popup-title');
    const saveBtn = translationPopup.querySelector('#save-translation');
    const viewAllBtn = translationPopup.querySelector('#go-google-web');
    const translatingText = translationPopup.querySelector('#translated-text');

    if (popupTitle) popupTitle.textContent = uiTexts.translation;
    if (saveBtn) saveBtn.textContent = uiTexts.save;
    if (viewAllBtn) viewAllBtn.textContent = uiTexts.viewAllTranslations;
    if (translatingText) translatingText.textContent = uiTexts.translating;
  }

  // 선택된 텍스트 전체 영역 가져오기
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // 팝업을 선택 영역 바로 아래에 배치
  translationPopup.style.left = `${rect.left + window.scrollX}px`;
  translationPopup.style.top = `${rect.bottom + window.scrollY + 10}px`;
  translationPopup.style.display = 'block';

  console.log('Popup displayed successfully');
  console.log('translated-text element:', document.getElementById('translated-text'));
}

function hidePopup() {
  if (translationPopup) translationPopup.style.display = 'none';
}

/* =========================
   번역
========================= */
async function translate(text) {
  console.log('Starting translation for:', text.substring(0, 50));

  // translationPopup이 존재하는지 확인
  if (!translationPopup) {
    console.error('Translation popup not found');
    return;
  }

  // 팝업 내부의 요소를 직접 쿼리
  const el = translationPopup.querySelector('#translated-text');
  if (!el) {
    console.error('Translation element not found in popup');
    console.log('Popup HTML:', translationPopup.innerHTML);
    return;
  }

  console.log('Translation element found:', el);

  const uiTexts = getUILanguage(currentUILanguage);
  el.textContent = uiTexts.translating;

  try {
    // chrome.runtime이 유효한지 확인
    if (!chrome.runtime || !chrome.runtime.id) {
      throw new Error('Extension context invalidated');
    }

    // 사용자 설정에서 목표 언어 가져오기
    const settings = await chrome.storage.sync.get(['targetLanguage']);
    const targetLang = settings.targetLanguage || 'ko';
    console.log('Target language:', targetLang);

    // 타임아웃 추가 (15초)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Translation timeout')), 15000);
    });

    const translationPromise = chrome.runtime.sendMessage({
      action: 'translate',
      text,
      targetLang: targetLang
    });

    console.log('Message sent to background, waiting for response...');
    const res = await Promise.race([translationPromise, timeoutPromise]);
    console.log('Translation response:', res);

    if (res?.success) {
      translatedText = res.translatedText;
      console.log('Setting translated text:', translatedText);
      el.textContent = translatedText;
      console.log('Translation successful, element updated:', el.textContent);
    } else {
      translatedText = '';
      const errorMsg = res?.error || 'Unknown error';
      console.error('Translation failed:', errorMsg);
      el.textContent = uiTexts.translationFailed || chrome.i18n.getMessage('translationFailed') || 'Translation failed';
    }
  } catch (error) {
    console.error('Translation error:', error);
    translatedText = '';

    // Extension context invalidated 에러 처리
    if (error.message && error.message.includes('Extension context invalidated')) {
      el.textContent = 'Please reload the page (F5)';
    } else if (error.message === 'Translation timeout') {
      el.textContent = uiTexts.translationTimeout || 'Translation timeout. Please try again.';
    } else {
      el.textContent = uiTexts.errorOccurred || chrome.i18n.getMessage('errorOccurred') || 'An error occurred';
    }
  }
}

/* =========================
   저장 기능
========================= */
async function saveTranslation() {
  if (!selectedText || !translatedText) {
    alert(chrome.i18n.getMessage('noTranslationToSave'));
    return;
  }

  try {
    // chrome.runtime이 유효한지 확인
    if (!chrome.runtime || !chrome.runtime.id) {
      alert('Extension context invalidated. Please reload the page (F5)');
      return;
    }
    const timestamp = new Date().toISOString();
    const selectionInfo = getSelectionInfo();
    const newEntry = {
      id: Date.now(),
      original: selectedText,
      translated: translatedText,
      pageUrl: window.location.href,
      pageTitle: document.title,
      selectionStart: selectionInfo?.startIndex ?? null,
      selectionLength: selectionInfo?.length ?? null,
      timestamp: timestamp,
      date: new Date().toLocaleString()
    };

    // 기존 저장 데이터 가져오기
    const result = await chrome.storage.local.get(['translations']);
    const translations = result.translations || [];

    // 새 항목 추가 (최신 항목이 맨 앞에)
    translations.unshift(newEntry);

    // 최대 100개까지만 저장
    if (translations.length > 100) {
      translations.pop();
    }

    // 저장
    await chrome.storage.local.set({ translations });

    // 저장 완료 알림
    const saveBtn = document.getElementById('save-translation');
    if (saveBtn) {
      const originalText = saveBtn.textContent;
      saveBtn.textContent = chrome.i18n.getMessage('saved');
      saveBtn.disabled = true;
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
      }, 2000);
    }
  } catch (error) {
    console.error('Save failed:', error);
    alert(chrome.i18n.getMessage('saveFailed'));
  }
}

/* =========================
   이벤트
========================= */
document.addEventListener('mousedown', e => {
  dragStartX = e.pageX;
});

document.addEventListener('mouseup', e => {
  dragEndX = e.pageX;

  if (
    e.target.closest('.translator-action-btn') ||
    e.target.closest('.translator-popup')
  ) return;

  setTimeout(showButton, 10);
});

// 마우스 이동 시 선택 영역이나 버튼 위에 있으면 버튼 밝게 + 타이머 리셋
document.addEventListener('mousemove', e => {
  if (!translateButton || translateButton.style.display === 'none') return;

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

  // 버튼 위에 마우스가 있으면 타이머 리셋
  if (e.target.closest('.translator-action-btn')) {
    clearTimeout(hideButtonTimer);
    hideButtonTimer = setTimeout(() => hideButton(), 3000);
    return;
  }

  // 선택된 텍스트 범위 확인
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

  // 선택 영역 위에 있으면 버튼 밝게 + 타이머 리셋
  if (isOverSelection) {
    translateButton.style.opacity = '1';
    clearTimeout(hideButtonTimer);
    hideButtonTimer = setTimeout(() => hideButton(), 3000);
  } else {
    translateButton.style.opacity = '';
  }
});

document.addEventListener('mousedown', e => {
  // 팝업이나 버튼 외부를 클릭하면 팝업 닫기
  if (
    translationPopup &&
    translationPopup.style.display !== 'none' &&
    !e.target.closest('.translator-popup') &&
    !e.target.closest('.translator-action-btn')
  ) {
    hidePopup();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    hideButton();
    hidePopup();
    window.getSelection()?.removeAllRanges();
  }
});

// 스크롤 시 버튼 위치 재계산
document.addEventListener('scroll', () => {
  if (!translateButton || translateButton.style.display === 'none') return;

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

  // 버튼 위치 다시 계산
  const rect = getDragEndCaretRect();
  if (!rect) return;

  const btnW = 30;
  const btnH = 28;
  const gap = 8;

  const isLTR = dragEndX >= dragStartX;

  const x = isLTR
    ? rect.right + window.scrollX + gap
    : rect.left + window.scrollX - btnW - gap;

  const y =
    rect.top +
    window.scrollY +
    rect.height / 2 -
    btnH / 2;

  translateButton.style.left = `${x}px`;
  translateButton.style.top = `${y}px`;
}, true);

function getTextNodes(root) {
  const nodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue) {
      nodes.push(node);
    }
  }
  return nodes;
}

function getSelectionInfo() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;

  const range = sel.getRangeAt(0);
  const nodes = getTextNodes(document.body);
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
}

function createRangeFromTextIndex(startIndex, length) {
  const nodes = getTextNodes(document.body);
  let index = 0;
  let startNode = null;
  let startOffset = 0;
  let endNode = null;
  let endOffset = 0;
  const endIndex = startIndex + length;

  for (const node of nodes) {
    const nodeLength = node.nodeValue.length;
    if (!startNode && startIndex <= index + nodeLength) {
      startNode = node;
      startOffset = Math.max(0, startIndex - index);
    }
    if (startNode && endIndex <= index + nodeLength) {
      endNode = node;
      endOffset = Math.max(0, endIndex - index);
      break;
    }
    index += nodeLength;
  }

  if (!startNode) return null;
  if (!endNode) {
    endNode = startNode;
    endOffset = Math.min(startNode.nodeValue.length, startOffset);
  }

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range;
}

function removeHighlight(highlight) {
  if (!highlight || !highlight.parentNode) return;
  const parent = highlight.parentNode;
  while (highlight.firstChild) {
    parent.insertBefore(highlight.firstChild, highlight);
  }
  parent.removeChild(highlight);
  parent.normalize();
}

function applyHighlightStyles(el) {
  el.className = '__dt-highlight';
  el.setAttribute('data-dt-highlight', 'true');
  el.style.setProperty('background-color', '#ffb347', 'important');
  el.style.setProperty('color', '#1f1f1f', 'important');
  el.style.setProperty('padding', '0 2px', 'important');
  el.style.setProperty('border-radius', '2px', 'important');
  el.style.setProperty('box-shadow', '0 0 0 1px rgba(0,0,0,0.08)', 'important');
  el.style.setProperty('display', 'inline', 'important');
}

function addTemporaryHighlight(range) {
  if (!range) return false;
  try {
    const highlight = document.createElement('span');
    applyHighlightStyles(highlight);

    try {
      range.surroundContents(highlight);
    } catch (error) {
      const contents = range.extractContents();
      highlight.appendChild(contents);
      range.insertNode(highlight);
    }
    highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => removeHighlight(highlight), 4000);
    return true;
  } catch (error) {
    console.warn('Failed to highlight range:', error);
    const parent = range.startContainer.parentElement;
    if (parent) {
      parent.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    }
  }
  return false;
}

function highlightRange(range) {
  return addTemporaryHighlight(range);
}

function getDeepLinkId() {
  const hash = window.location.hash || '';
  if (!hash.includes('dt-id=')) return null;
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return params.get('dt-id');
}

function findAndHighlightText(text) {
  if (!text) return false;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const index = node.nodeValue.indexOf(text);
    if (index !== -1) {
      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + text.length);

      return addTemporaryHighlight(range);
    }
  }

  return false;
}

async function scrollToSavedTranslation() {
  const entryId = getDeepLinkId();
  if (!entryId) return;

  try {
    const result = await chrome.storage.local.get(['translations']);
    const translations = result.translations || [];
    const entry = translations.find(item => item.id.toString() === entryId);
    if (!entry || !entry.original) return;

    if (entry.selectionStart !== null && entry.selectionLength !== null) {
      const range = createRangeFromTextIndex(entry.selectionStart, entry.selectionLength);
      if (highlightRange(range)) {
        return;
      }
    }

    findAndHighlightText(entry.original);
  } catch (error) {
    console.error('Failed to load translation for deep link:', error);
  }
}

scrollToSavedTranslation();

} // end of if (!window.__translatorInitialized)
