# Fail and Trial - DragTranslator 개발 기록

이 문서는 DragTranslator Chrome 확장 프로그램 개발 중 겪었던 문제들과 해결 과정을 기록합니다.

## 목차
1. [Privacy Policy 누락 문제](#1-privacy-policy-누락-문제)
2. [Git Push 충돌](#2-git-push-충돌)
3. [새 페이지에서 번역 미작동](#3-새-페이지에서-번역-미작동)
4. [Invisible Character 에러](#4-invisible-character-에러)
5. [브라우저 캐싱 문제](#5-브라우저-캐싱-문제)
6. [번역 속도 느림](#6-번역-속도-느림)
7. [재시도 로직 부재](#7-재시도-로직-부재)
8. [Extension Context Invalidated](#8-extension-context-invalidated)
9. [번역 결과 미표시 문제](#9-번역-결과-미표시-문제)
10. [SVG 모서리 직각 표시](#10-svg-모서리-직각-표시)
11. [사용하지 않는 권한 정책 위반](#11-사용하지-않는-권한-정책-위반)
12. [팝업이 스크롤을 따라가지 않음](#12-팝업이-스크롤을-따라가지-않음)
13. [팝업 위치 고정 불가](#13-팝업-위치-고정-불가)

---

## 1. Privacy Policy 누락 문제

### 문제
Chrome Web Store에 제출 시 거절당함:
```
정정 방법: 링크가 개인정보처리방침 페이지에 바로 연결되도록 합니다
```

### 원인
- Chrome Web Store는 사용자 데이터를 저장하는 모든 확장 프로그램에 대해 개인정보처리방침을 요구함
- 번역 기록을 로컬 스토리지에 저장하므로 정책 필요

### 해결
1. `privacy-policy.md` 파일 생성
2. 다음 내용 포함:
   - 데이터 수집 항목 (번역 기록, 사용자 설정)
   - 데이터 저장 위치 (로컬 브라우저)
   - 제3자 서비스 (Google Translate API)
   - 사용자 권리 (접근, 삭제, 내보내기)
   - 권한 설명
3. GitHub Pages로 호스팅 예정: `https://baek0203.github.io/DragTranslator/privacy-policy`

### 교훈
- Chrome Web Store 제출 전에 개인정보처리방침을 반드시 준비해야 함
- 로컬 스토리지만 사용해도 정책이 필요함

---

## 2. Git Push 충돌

### 문제
```bash
! [rejected] main -> main (fetch first)
error: failed to push some refs
```

### 원인
- 원격 저장소에 로컬에 없는 커밋이 존재함
- 여러 환경에서 작업하거나 웹에서 직접 수정한 경우 발생

### 해결
```bash
git pull origin main --rebase
git push origin main
```

### 교훈
- Push 전에 항상 원격 저장소의 변경사항을 확인
- `--rebase` 옵션으로 깔끔한 커밋 히스토리 유지

---

## 3. 새 페이지에서 번역 미작동

### 문제
- 사이트에 처음 접속하면 번역 버튼 클릭 시 "번역중..." 상태에서 무한대로 멈춤
- F5로 새로고침 후에야 번역 가능

### 시도한 해결책들

#### 시도 1: manifest.json 수정 (실패)
```json
// document_end → document_idle 변경
"run_at": "document_idle"
```
**결과**: 오히려 아예 작동하지 않게 됨

#### 시도 2: chrome.tabs.onUpdated 리스너 추가 (실패)
```javascript
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // content script 재주입 시도
  }
});
```
**결과**: 스크립트 중복 주입으로 충돌 발생

#### 시도 3: IIFE 래퍼 추가 (실패)
```javascript
(function() {
  if (window.__translatorInjected) return;
  window.__translatorInjected = true;
  // ... content script code
})();
```
**결과**: 스코프 문제로 함수들이 정상 작동하지 않음

### 최종 해결
```json
// manifest.json - 원래대로 되돌림
"run_at": "document_end"
```

```javascript
// content.js - 단순한 중복 방지
if (window.__translatorInitialized) {
  console.log('Translator already initialized, skipping...');
} else {
  window.__translatorInitialized = true;
  // ... rest of code
}
```

### 실제 원인
새 페이지 문제가 아니라 **Extension Context Invalidated** 문제였음 (아래 참조)

### 교훈
- 복잡한 해결책보다 단순한 방법이 더 효과적일 수 있음
- 문제의 근본 원인을 먼저 파악해야 함

---

## 4. Invisible Character 에러

### 문제
```
Uncaught ReferenceError: ㅣ is not defined
```

### 원인
- background.js 파일 첫 줄에 보이지 않는 한글 자모 문자가 삽입됨
- 린터나 에디터가 의도치 않게 추가한 것으로 추정

### 해결
```bash
sed '1d' background.js > temp && mv temp background.js
```

또는 에디터에서 첫 줄을 삭제하고 저장

### 교훈
- 알 수 없는 에러 발생 시 파일의 보이지 않는 문자 확인 필요
- `cat -A` 또는 `hexdump`로 숨겨진 문자 확인 가능

---

## 5. 브라우저 캐싱 문제

### 문제
- 코드를 수정하고 확장 프로그램을 다시 로드해도 변경사항이 반영되지 않음
- "계속 똑같음" - 같은 에러가 계속 발생

### 원인
- Chrome이 확장 프로그램 파일을 캐시함
- Service Worker가 이전 버전의 스크립트를 계속 사용

### 해결
1. Chrome 확장 프로그램 페이지(`chrome://extensions`)에서 확장 프로그램 제거
2. Chrome 브라우저 완전 종료
3. Chrome 재시작
4. 확장 프로그램 새로 설치

### 개발 중 임시 해결책
- 각 테스트 페이지를 F5로 새로고침
- Service Worker를 수동으로 재시작 (확장 프로그램 페이지의 "Service Worker" 링크 클릭)

### 교훈
- 확장 프로그램 개발 시 캐싱은 항상 문제가 될 수 있음
- 변경사항이 반영되지 않으면 완전히 재설치 고려

---

## 6. 번역 속도 느림

### 문제
- "번역하는데 시간이 조금 걸림"
- 사용자가 번역 버튼 클릭 후 몇 초간 대기해야 함

### 원인
- 여러 번역 API를 순차적으로 시도하는 폴백 로직:
  1. Google Translate (실패 시)
  2. MyMemory API (실패 시)
  3. LibreTranslate API

### 해결
```javascript
// background.js - 폴백 API 제거
// Google Translate API만 사용
async function translateText(text, targetLang, sourceLang = 'auto', retryCount = 2) {
  // Google Translate만 호출
  // 타임아웃: 5초
  // 재시도: 최대 2회
}
```

**제거한 함수들:**
- `translateWithMyMemory()`
- `translateWithLibre()`

### 교훈
- 과도한 폴백 로직은 성능을 저하시킴
- 주 API(Google Translate)가 충분히 안정적이면 폴백 불필요
- 재시도 로직으로 충분히 안정성 확보 가능

---

## 7. 재시도 로직 부재

### 문제
- 네트워크 일시적 오류로 번역이 실패하면 재시도 없이 바로 실패
- "왜 안될까. 보니까 계속 시도해야할 것 같은데? 한번만 해서 문제가 되는거 아니야?"

### 해결
```javascript
async function translateText(text, targetLang, sourceLang = 'auto', retryCount = 2) {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      // 5초 타임아웃
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      // 성공하면 바로 반환
      return { success: true, translatedText: ... };
    } catch (error) {
      console.error(`Translation attempt ${attempt} failed:`, error);

      // 마지막 시도가 아니면 재시도
      if (attempt < retryCount) {
        await new Promise(resolve => setTimeout(resolve, 300)); // 0.3초 대기
        continue;
      }

      // 모두 실패
      return { success: false, error: error.message };
    }
  }
}
```

**주요 개선사항:**
- 최대 2회 재시도 (총 3번 시도)
- 각 시도마다 5초 타임아웃
- 재시도 사이 0.3초 대기
- User-Agent 헤더 추가

### 교훈
- 네트워크 요청은 항상 재시도 로직을 포함해야 함
- 적절한 타임아웃과 재시도 간격이 중요함

---

## 8. Extension Context Invalidated

### 문제
```
Uncaught (in promise) Error: Extension context invalidated
```

콘솔에 반복적으로 표시되며 번역이 전혀 작동하지 않음.

### 원인
- 개발 중 확장 프로그램을 다시 로드할 때 발생
- 이전에 주입된 content script들이 페이지에 남아있음
- 오래된 content script가 새로운 background service worker와 통신 시도
- `chrome.runtime.id`가 유효하지 않아 메시지 전송 실패

### 해결책

#### 1. 중복 초기화 방지
```javascript
// content.js
if (window.__translatorInitialized) {
  console.log('Translator already initialized, skipping...');
} else {
  window.__translatorInitialized = true;
  console.log('Initializing translator...');
  // ... rest of code
}
```

#### 2. Context 유효성 검사
```javascript
async function translate(text) {
  // chrome.runtime이 유효한지 확인
  if (!chrome.runtime || !chrome.runtime.id) {
    throw new Error('Extension context invalidated');
  }
  // ... 번역 로직
}

async function showPopup() {
  if (!chrome.runtime || !chrome.runtime.id) {
    console.error('Extension context invalidated');
    return;
  }
  // ... 팝업 로직
}
```

#### 3. 사용자 친화적 에러 메시지
```javascript
catch (error) {
  if (error.message && error.message.includes('Extension context invalidated')) {
    el.textContent = 'Please reload the page (F5)';
  }
}
```

### 개발 중 해결 방법
1. 확장 프로그램을 다시 로드한 후
2. **반드시 테스트 페이지를 F5로 새로고침**
3. 그러면 새로운 content script가 로드되어 정상 작동

### 프로덕션 환경
- 사용자는 확장 프로그램을 자주 다시 로드하지 않으므로 이 문제 발생 빈도 낮음
- 만약 발생하면 사용자에게 "Please reload the page (F5)" 메시지 표시

### 교훈
- Chrome 확장 프로그램 개발 시 context invalidation은 흔한 문제
- 개발 환경과 프로덕션 환경의 차이를 이해해야 함
- 항상 `chrome.runtime.id` 유효성을 검사해야 함

---

## 9. 번역 결과 미표시 문제

### 문제
- 콘솔 로그에는 "Translation successful: [번역된 텍스트]"가 나타남
- 하지만 팝업에는 "번역중..." 상태로 계속 표시됨
- 번역은 성공했지만 UI가 업데이트되지 않음

### 디버깅 과정
```javascript
// 로그 확인
console.log('Popup displayed successfully');
console.log('Translation response:', res);
console.log('Translation successful: Document Understanding - DocLayNet YOLO');
```

모든 로그가 정상적으로 출력되지만 화면은 변하지 않음.

### 원인
```javascript
// 잘못된 방법
const el = document.getElementById('translated-text');
```

`document.getElementById`는 전체 문서에서 요소를 찾지만, 팝업이 Shadow DOM이나 다른 컨텍스트에 있을 수 있음.

### 해결
```javascript
// 올바른 방법
const el = translationPopup.querySelector('#translated-text');
```

팝업 요소를 직접 참조하여 내부의 요소를 쿼리.

### 추가 개선
```javascript
async function translate(text) {
  console.log('Starting translation for:', text.substring(0, 50));

  // translationPopup 존재 확인
  if (!translationPopup) {
    console.error('Translation popup not found');
    return;
  }

  // 팝업 내부에서 직접 쿼리
  const el = translationPopup.querySelector('#translated-text');
  if (!el) {
    console.error('Translation element not found in popup');
    console.log('Popup HTML:', translationPopup.innerHTML);
    return;
  }

  console.log('Translation element found:', el);
  // ... 번역 로직
  console.log('Setting translated text:', translatedText);
  el.textContent = translatedText;
  console.log('Translation successful, element updated:', el.textContent);
}
```

### 교훈
- DOM 요소 참조 시 컨텍스트가 중요함
- `document.getElementById` vs `element.querySelector` 차이 이해 필요
- 충분한 로깅으로 정확한 문제 위치 파악

---

## 10. SVG 모서리 직각 표시

### 문제
- 번역 버튼의 모서리가 둥글게 표시되어야 하는데 직각 네모로 표시됨
- CSS에는 `border-radius: 8px`가 설정되어 있음

### 원인
```javascript
// SVG에 흰색 배경 rect가 있었음
btn.innerHTML = `
  <svg viewBox="0 0 24 24">
    <rect width="24" height="24" fill="#FFFFFF" rx="4"/>  // 이 부분
    <path d="..." fill="#4285F4"/>
  </svg>
`;
```

SVG 내부의 `<rect>` 요소가 자체 `rx="4"` 속성을 가지고 있어서 CSS의 `border-radius`가 제대로 적용되지 않음.

### 해결
```javascript
// rect 제거, path만 남김
btn.innerHTML = `
  <svg viewBox="0 0 24 24">
    <path d="..." fill="#4285F4"/>
  </svg>
`;
```

CSS의 `border-radius`와 `background: #ffffff`로 버튼 컨테이너에 스타일 적용.

### 추가 개선: 모든 URL 지원
```json
// manifest.json
"host_permissions": [
  "<all_urls>"  // 모든 웹사이트에서 작동
]
```

### 교훈
- SVG 내부 요소의 스타일이 외부 CSS를 오버라이드할 수 있음
- 불필요한 SVG 요소는 제거하고 CSS로 처리하는 것이 더 유연함
- 확장 프로그램은 가능한 한 넓은 범위에서 작동하도록 권한 설정

---

## 전체 개발 타임라인

1. **초기 문제**: Privacy Policy 누락 → 해결
2. **Git 문제**: Push 충돌 → Rebase로 해결
3. **핵심 문제 발견**: Extension Context Invalidated
4. **잘못된 진단**: "새 페이지에서 작동 안 함"으로 오해
5. **시행착오**: document_idle, chrome.tabs.onUpdated, IIFE 등 시도 → 모두 실패
6. **성능 문제**: 느린 번역 속도 → 폴백 API 제거
7. **안정성 개선**: 재시도 로직 추가
8. **근본 원인 해결**: Context invalidation 처리
9. **UI 문제**: 번역 결과 미표시 → querySelector로 해결
10. **디자인 문제**: 버튼 모서리 → SVG 수정
11. **정책 위반**: scripting 권한 제거
12. **UX 개선**: 팝업 스크롤 따라가기 (position: fixed)
13. **고급 기능**: 팝업 드래그 앤 드롭 구현

---

## 주요 교훈

### 1. 문제 진단의 중요성
- "새 페이지에서 작동 안 함"은 증상일 뿐, 원인은 "Extension Context Invalidated"였음
- 근본 원인을 파악하지 않고 증상만 보고 해결하려다 시간 낭비

### 2. 단순함의 가치
- 복잡한 IIFE, 리스너 추가 등의 시도보다 단순한 중복 방지 플래그가 더 효과적
- 폴백 API 여러 개보다 재시도 로직이 더 나음

### 3. Chrome 확장 프로그램 특성 이해
- Context invalidation은 개발 중에만 자주 발생
- 브라우저 캐싱 문제
- Content script vs Background script 생명주기

### 4. 디버깅 기법
- 충분한 console.log 사용
- 각 단계별 확인
- 가정하지 말고 확인하기

### 5. 사용자 경험
- 에러 메시지는 사용자 친화적으로
- "Extension context invalidated" (X)
- "Please reload the page (F5)" (O)

### 6. CSS Position 속성의 중요성
- `absolute` vs `fixed` 선택이 사용자 경험을 크게 좌우
- `fixed`는 viewport 기준이므로 스크롤에 영향받지 않음
- UI 요소가 화면에 고정되어야 하는지 문서에 고정되어야 하는지 명확히

### 7. 사용자에게 제어권 주기
- 자동화와 수동 제어의 균형
- 기본 동작은 편리하게, 고급 옵션도 제공
- 드래그 앤 드롭은 직관적이고 강력한 UI 패턴
- 상태 플래그로 모드 전환 구현

---

## 남은 개선 사항

### 단기
- [x] 팝업 스크롤 따라가기 구현
- [x] 팝업 드래그 앤 드롭 구현
- [x] 사용하지 않는 권한 제거
- [ ] 디버깅 로그 제거 또는 production 빌드 시 제거
- [ ] Privacy Policy를 GitHub Pages에 호스팅
- [ ] Chrome Web Store에 재제출

### 중기
- [ ] 팝업 위치 기억하기 (localStorage)
- [ ] 팝업 크기 조절 가능하게
- [ ] 더 많은 언어 지원
- [ ] 번역 히스토리 검색 기능
- [ ] 커스텀 단축키 지원

### 장기
- [ ] 오프라인 번역 지원 검토
- [ ] 다른 번역 API 옵션 제공 (설정에서 선택 가능)
- [ ] 음성 출력 기능
- [ ] 실시간 번역 (타이핑하면서 번역)

---

## 11. 사용하지 않는 권한 정책 위반

### 문제
Chrome Web Store 제출 시 거절당함:
```
권한 사용 위반 참조 ID: Purple Potassium
다음 권한을 요청하지만 사용하지는 않습니다(scripting).
```

### 원인
```json
// manifest.json
"permissions": [
  "storage",
  "activeTab",
  "scripting"  // 이 권한을 사용하지 않음
]
```

`scripting` 권한은 `chrome.scripting` API를 사용할 때 필요한데, 실제로는 `content_scripts`를 통해 자동으로 스크립트를 주입하고 있었음.

### 해결
```json
// manifest.json - scripting 권한 제거
"permissions": [
  "storage",
  "activeTab"
]
```

### 교훈
- Chrome Web Store는 사용하지 않는 권한을 매우 엄격하게 검사함
- `content_scripts`로 자동 주입하는 경우 `scripting` 권한 불필요
- 권한은 최소한으로만 요청해야 함
- 각 권한이 실제로 사용되는지 확인 필요

**관련 정책:**
- [Chrome 확장 프로그램 권한](https://developer.chrome.com/docs/webstore/program-policies/permissions/)
- [과도한 권한 문제 해결](https://developer.chrome.com/docs/webstore/troubleshooting?hl=ko#excessive-permissions)

---

## 12. 팝업이 스크롤을 따라가지 않음

### 문제
번역 팝업이 스크롤해도 화면에 고정되지 않고 원래 위치에 머물러서 사용자가 스크롤하면 팝업이 보이지 않게 됨.

**증상:**
- 팝업이 나타난 후 스크롤하면 팝업이 화면 밖으로 벗어남
- 선택된 텍스트와 팝업의 위치 관계가 유지되지 않음

### 원인
```css
/* styles.css */
.translator-popup {
  position: absolute;  /* 문서 기준 절대 위치 */
  z-index: 10001;
}
```

```javascript
// content.js - 스크롤 오프셋 포함
translationPopup.style.left = `${rect.left + window.scrollX}px`;
translationPopup.style.top = `${rect.bottom + window.scrollY + 10}px`;
```

`position: absolute`는 문서 전체를 기준으로 위치를 정하므로 스크롤해도 팝업이 원래 자리에 고정됨.

### 해결

#### 1. CSS 수정
```css
/* styles.css */
.translator-popup {
  position: fixed;  /* viewport 기준으로 변경 */
  z-index: 10001;
}
```

#### 2. JavaScript 수정
```javascript
// content.js - 스크롤 오프셋 제거
translationPopup.style.left = `${rect.left}px`;
translationPopup.style.top = `${rect.bottom + 10}px`;
```

`position: fixed`는 viewport(화면)를 기준으로 하므로 `getBoundingClientRect()`의 값을 그대로 사용.

### 교훈
- `position: absolute` vs `position: fixed` 차이 이해 중요
- `absolute`: 문서 기준, 스크롤 시 함께 이동
- `fixed`: viewport 기준, 스크롤해도 화면 위치 유지
- `getBoundingClientRect()`는 항상 viewport 기준 좌표 반환

---

## 13. 팝업 위치 고정 불가

### 문제
팝업이 선택된 텍스트를 따라가는 것은 좋지만, 사용자가 원하는 위치에 팝업을 고정하고 싶을 때 방법이 없음.

**사용자 시나리오:**
1. 긴 텍스트를 번역하면서 스크롤해서 읽고 싶음
2. 하지만 팝업이 텍스트를 따라가서 화면을 가림
3. 팝업을 화면 한쪽 구석에 두고 싶음

### 해결 과정

#### 시도 1: 팝업을 스크롤 시 선택된 텍스트 따라가도록
```javascript
// 스크롤 이벤트에서 팝업 위치 업데이트
document.addEventListener('scroll', () => {
  if (translationPopup && translationPopup.style.display === 'block') {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      translationPopup.style.left = `${rect.left}px`;
      translationPopup.style.top = `${rect.bottom + 10}px`;
    }
  }
}, true);
```

**문제:** 팝업을 원하는 위치에 고정할 수 없음.

#### 최종 해결: 드래그 가능 + 조건부 따라가기

**1. 팝업 헤더 드래그 가능하게 만들기:**

```javascript
// 드래그 관련 변수
let popupDragging = false;
let popupDragStartX = 0;
let popupDragStartY = 0;
let popupOffsetX = 0;
let popupOffsetY = 0;
let popupManuallyMoved = false; // 핵심: 수동 이동 여부 추적

// 헤더에 마우스 다운 이벤트
header.onmousedown = (e) => {
  if (e.target.classList.contains('close-x')) return;

  popupDragging = true;
  popupDragStartX = e.clientX;
  popupDragStartY = e.clientY;

  const rect = p.getBoundingClientRect();
  popupOffsetX = rect.left;
  popupOffsetY = rect.top;

  e.preventDefault();
};
```

**2. 마우스 이동으로 팝업 이동:**

```javascript
document.addEventListener('mousemove', e => {
  if (!popupDragging || !translationPopup) return;

  const deltaX = e.clientX - popupDragStartX;
  const deltaY = e.clientY - popupDragStartY;

  const newLeft = popupOffsetX + deltaX;
  const newTop = popupOffsetY + deltaY;

  translationPopup.style.left = `${newLeft}px`;
  translationPopup.style.top = `${newTop}px`;
});

document.addEventListener('mouseup', () => {
  if (popupDragging) {
    popupDragging = false;
    popupManuallyMoved = true; // 수동 이동했음을 표시
  }
});
```

**3. 조건부 스크롤 따라가기:**

```javascript
document.addEventListener('scroll', () => {
  // 팝업 위치 재계산 (사용자가 수동으로 이동하지 않은 경우만)
  if (translationPopup && translationPopup.style.display === 'block' && !popupManuallyMoved) {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      translationPopup.style.left = `${rect.left}px`;
      translationPopup.style.top = `${rect.bottom + 10}px`;
    }
  }
}, true);
```

**4. 팝업 닫을 때 플래그 초기화:**

```javascript
function hidePopup() {
  if (translationPopup) {
    translationPopup.style.display = 'none';
    popupManuallyMoved = false; // 다음에는 다시 자동 따라가기
  }
}
```

**5. CSS로 시각적 힌트:**

```css
.popup-header {
  cursor: move;  /* 드래그 가능함을 표시 */
  user-select: none;  /* 드래그 중 텍스트 선택 방지 */
}

.popup-header:active {
  cursor: grabbing;  /* 드래그 중 */
}
```

### 최종 동작

1. **기본 동작**: 팝업이 선택된 텍스트를 따라감 (스크롤해도)
2. **수동 이동**: 헤더를 드래그하면 그 위치에 고정
3. **재시작**: 팝업을 닫고 다시 열면 다시 자동 따라가기 모드

### 교훈
- 사용자에게 선택권을 주는 것이 중요
- 기본 동작은 편리하게 (자동 따라가기)
- 고급 사용자를 위한 옵션 제공 (수동 위치 조정)
- 드래그 앤 드롭은 직관적인 UI 패턴
- 상태 플래그(`popupManuallyMoved`)로 두 가지 모드 전환

---

## 참고 자료

- [Chrome Extension Manifest V3 문서](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Extension Context Invalidation](https://stackoverflow.com/questions/53939205/how-to-avoid-extension-context-invalidated-errors-when-messaging-after-an-exte)
- [Google Translate API 비공식 엔드포인트](https://stackoverflow.com/questions/26714426/what-is-the-meaning-of-google-translate-query-params)

---

**마지막 업데이트**: 2026-01-12

---

## 14. 언어 리스트 미표시 (모듈화 이후)

### 문제
설정 화면에서 언어 리스트가 비어있고, 콘솔에 다음 에러가 반복됨:
```
[DragTranslator] Language list is not available.
```

### 원인
`i18n.js`를 모듈화하면서 전역으로 노출되던 `LANGUAGES` 배열이 사라짐.  
`language-grid.js`는 전역 `LANGUAGES`를 기준으로 렌더링하므로 빈 목록으로 처리됨.

### 해결
1) `src/shared/i18n.js`에 `LANGUAGES` 배열 복구  
2) 전역 바인딩을 명시적으로 노출 (`globalThis.LANGUAGES`)  
3) `language-grid.js`에서 `globalThis.LANGUAGES` 폴백 추가

```javascript
// src/shared/i18n.js
const LANGUAGES = [
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  // ...
];

__dtRoot.LANGUAGES = LANGUAGES;
```

```javascript
// src/shared/language-grid.js
const languages = (typeof LANGUAGES !== 'undefined' && LANGUAGES)
  ? LANGUAGES
  : globalThis.LANGUAGES;
```

### 교훈
- 모듈화 후에도 기존 코드가 전역 변수를 참조하는지 반드시 점검
- 공용 데이터는 한 곳에서 정의하고 명시적으로 export/노출하기

## 버전별 주요 변경사항

### v1.4.3 (2026-01-12)
- ✅ 팝업 position을 fixed로 변경 (스크롤 시 화면 고정)
- ✅ 팝업 헤더 드래그 앤 드롭 기능 추가
- ✅ 조건부 스크롤 따라가기 (수동 이동 시 위치 고정)
- ✅ scripting 권한 제거 (정책 위반 해결)

### v1.4.2 (2026-01-11)
- ✅ 번역 결과 미표시 문제 해결
- ✅ Extension context invalidated 에러 처리
- ✅ 재시도 로직 추가 (2회)
- ✅ 버튼 모서리 둥글게 표시
- ✅ 성능 개선 (폴백 API 제거)

### v1.4.1 (2026-01-09)
- ✅ Privacy Policy 추가
- ✅ 10개 언어 지원
- ✅ 번역 히스토리 기능
- ✅ 설정 페이지
