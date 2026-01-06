let translateButton = null;
let translationPopup = null;
let selectedText = '';

let dragStartX = 0;
let dragEndX = 0;

let hideButtonTimer = null;

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
      <rect width="24" height="24" fill="#FFFFFF" rx="4"/>
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

    showPopup();
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
function showPopup() {
  if (!translationPopup) {
    const p = document.createElement('div');
    p.className = 'translator-popup';
    p.style.display = 'none';
    p.innerHTML = `
      <div class="popup-header">
        <span>번역</span>
        <button class="close-x">✕</button>
      </div>
      <div class="popup-content" id="translated-text">번역 중...</div>
      <div class="popup-footer">
        <button id="go-google-web">모든 번역 보기</button>
      </div>
    `;
    p.querySelector('.close-x').onclick = hidePopup;
    p.querySelector('#go-google-web').onclick = () => {
      const url = `https://translate.google.com/?sl=auto&tl=ko&text=${encodeURIComponent(selectedText)}`;
      window.open(url, '_blank');
    };

    document.body.appendChild(p);
    translationPopup = p;
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
}

function hidePopup() {
  if (translationPopup) translationPopup.style.display = 'none';
}

/* =========================
   번역
========================= */
async function translate(text) {
  const el = document.getElementById('translated-text');
  if (!el) return;

  el.textContent = '번역 중...';

  try {
    const res = await chrome.runtime.sendMessage({
      action: 'translate',
      text,
      targetLang: 'ko'
    });
    el.textContent = res?.success ? res.translatedText : '번역 실패';
  } catch {
    el.textContent = '오류 발생';
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
