# To Study - 학습 자료

DragTranslator 프로젝트를 구현하면서 알아야 할 핵심 개념들을 정리한 문서입니다.

---

## 1. Chrome Extension 기초

### Manifest V3
Chrome Extension의 설정 파일 형식. V2에서 V3로 마이그레이션이 필요합니다.

```json
{
  "manifest_version": 3,
  "background": {
    "service_worker": "background.js"  // V2: background.scripts
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "css": ["styles.css"]
  }]
}
```

**학습 자료:**
- [Chrome Extension Manifest V3 공식 문서](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [V2 → V3 마이그레이션 가이드](https://developer.chrome.com/docs/extensions/mv3/mv3-migration/)

### Service Worker vs Background Page
- V2: `background.html` + 지속적 실행
- V3: `service_worker` + 이벤트 기반 (유휴 시 종료됨)

```javascript
// background.js (Service Worker)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 비동기 응답 시 return true 필수
  handleAsync(request).then(sendResponse);
  return true;
});
```

### Content Script
웹 페이지에 주입되는 스크립트. 페이지 DOM에 접근 가능하지만 페이지의 JS와 격리됨.

```javascript
// content.js
document.addEventListener('mouseup', () => {
  const text = window.getSelection().toString();
  // chrome.runtime으로 background와 통신
});
```

---

## 2. DOM API

### Selection API
사용자가 선택한 텍스트를 다루는 API.

```javascript
// 선택된 텍스트 가져오기
const selection = window.getSelection();
const text = selection.toString();

// 선택 영역의 위치
const range = selection.getRangeAt(0);
const rect = range.getBoundingClientRect();

// 프로그래밍으로 텍스트 선택하기
selection.removeAllRanges();
selection.addRange(range);
```

**딥링크 하이라이트에서 사용:**
```javascript
function addTemporaryHighlight(range) {
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);  // 브라우저 기본 선택 스타일 적용

  setTimeout(() => selection.removeAllRanges(), 4000);
}
```

### Range API
문서의 특정 범위를 나타내는 객체.

```javascript
// Range 생성
const range = document.createRange();
range.setStart(textNode, startOffset);
range.setEnd(textNode, endOffset);

// Range의 위치
const rect = range.getBoundingClientRect();
```

### TreeWalker
DOM 트리를 순회하는 효율적인 방법.

```javascript
// 모든 텍스트 노드 순회
const walker = document.createTreeWalker(
  document.body,
  NodeFilter.SHOW_TEXT
);

let node;
while ((node = walker.nextNode())) {
  if (node.nodeValue.includes(searchText)) {
    // 찾음!
  }
}
```

---

## 3. Chrome Storage API

### sync vs local
```javascript
// sync: 로그인한 Chrome 계정 간 동기화 (100KB 제한)
chrome.storage.sync.get(['targetLanguage'], (result) => {
  console.log(result.targetLanguage);
});

// local: 로컬 저장 (5MB 제한)
chrome.storage.local.set({ translations: [] });
```

### 비동기 패턴
```javascript
// Promise 래핑
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['targetLanguage'], resolve);
  });
}

// 또는 Manifest V3에서는 Promise 지원
const result = await chrome.storage.sync.get(['targetLanguage']);
```

---

## 4. CSS 캡슐화

### 클래스 네이밍 컨벤션
호스트 페이지 스타일과 충돌을 방지하기 위한 전략.

```css
/* 일반적 이름 - 충돌 위험 */
.button { }
.popup { }

/* prefix 사용 - 충돌 방지 */
.__dt-btn { }
.__dt-popup { }
```

### !important 사용
호스트 페이지의 CSS가 우리 스타일을 오버라이드하지 못하게 방지.

```css
.__dt-popup {
  background: #202124 !important;
  z-index: 2147483647 !important;  /* 최대값 */
}
```

### z-index 최대값
JavaScript의 32비트 정수 최대값: `2147483647`

---

## 5. URL Hash (딥링크)

### Hash 파라미터
```javascript
// URL: https://example.com/page#dt-id=12345

// 읽기
const hash = window.location.hash;  // "#dt-id=12345"
const params = new URLSearchParams(hash.replace('#', ''));
const id = params.get('dt-id');  // "12345"

// 설정
const url = new URL(pageUrl);
url.hash = `dt-id=${translationId}`;
```

### 딥링크 구현 흐름
1. 번역 저장 시 `pageUrl`, `selectionStart`, `selectionLength` 저장
2. 팝업에서 링크 클릭 시 `#dt-id=<id>` 추가하여 이동
3. content.js에서 `dt-id` 파라미터 감지
4. 저장된 위치로 스크롤 + 하이라이트

---

## 6. 비동기 프로그래밍

### Promise.race (타임아웃 구현)
```javascript
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Timeout')), 15000);
});

const result = await Promise.race([
  fetchTranslation(text),
  timeoutPromise
]);
```

### AbortController (fetch 취소)
```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request timed out');
  }
}
```

---

## 7. 테스트 (Jest)

### 기본 구조
```javascript
describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return default settings', async () => {
    chrome.storage.sync.get.mockResolvedValue({});

    const settings = await StorageService.getSettings();

    expect(settings.targetLanguage).toBe('ko');
  });
});
```

### Chrome API 모킹
```javascript
// tests/setup.js
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: { addListener: jest.fn() }
  },
  storage: {
    sync: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue()
    }
  }
};
```

---

## 8. 모듈화 패턴

### 객체 리터럴 패턴
```javascript
const StorageService = {
  async getSettings() { /* ... */ },
  async saveSettings(settings) { /* ... */ }
};
```

### IIFE (즉시 실행 함수)
전역 스코프 오염 방지.

```javascript
(function() {
  // 이 안의 변수는 전역이 아님
  let privateVar = 'secret';

  // 필요한 것만 전역에 노출
  window.MyModule = { publicMethod };
})();
```

### 중복 실행 방지
```javascript
if (window.__translatorInitialized) return;
window.__translatorInitialized = true;
```

---

## 9. 번역 API

### Google Translate (비공식)
```javascript
const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

const response = await fetch(url);
const data = await response.json();
// data[0][0][0] = 번역 결과
// data[2] = 감지된 언어
```

**주의:** 비공식 API이므로 언제든 변경될 수 있음.

---

## 10. 브라우저 이벤트

### 이벤트 위임
```javascript
// 나쁜 예: 각 요소에 이벤트 리스너
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', handler);
});

// 좋은 예: 부모에서 위임
document.addEventListener('click', e => {
  if (e.target.closest('.btn')) {
    handler(e);
  }
});
```

### 이벤트 버블링 방지
```javascript
button.onclick = (e) => {
  e.preventDefault();      // 기본 동작 방지
  e.stopPropagation();     // 버블링 방지
};
```

---

## 추가 학습 자료

### 공식 문서
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

### 추천 강좌
- Chrome Extension 개발 입문 (YouTube)
- JavaScript 비동기 프로그래밍 심화

### 관련 프로젝트
- [Google Translate Extension](https://github.com/nicklockwood/iRate) - 참고용
- [Hypothesis Web Annotator](https://github.com/hypothesis/client) - 하이라이트 구현 참고

---

**작성일**: 2026-01-17
