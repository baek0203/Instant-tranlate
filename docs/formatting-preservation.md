# 번역 시 포맷 유지 (Formatting Preservation)

## 현재 문제

### 증상
스크린샷과 같이 여러 줄로 구성된 텍스트를 선택하면:

**원본:**
```
✓ Create unlimited AI agents
✓ Access the full Agent Library
✓ Real-time portfolio management
  ✓ 24/7 automated execution
✓ Full iteration history & smart notifications
```

**번역 결과:**
```
무제한 AI 에이전트 생성 전체 에이전트 라이브러리에 액세스 실시간 포트폴리오 관리 연중무휴 자동 실행 전체 반복 기록 및 스마트 알림
```

### 문제점
1. 줄바꿈이 모두 사라짐
2. 들여쓰기 무시됨
3. 특수 문자(✓, •, - 등) 유지 안 됨
4. 리스트 구조 깨짐

---

## 원인 분석

### 1. 텍스트 추출 방식
```javascript
// content.js
const sel = window.getSelection();
const text = sel?.toString().trim();
```

`Selection.toString()`은 선택된 텍스트를 **평문(plain text)**으로만 반환합니다:
- 줄바꿈은 공백으로 변환
- HTML 구조 정보 손실
- 포맷팅 정보 없음

### 2. Google Translate API의 한계
Google Translate API는 평문을 입력받아 평문을 반환:
```javascript
const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
```

입력에 줄바꿈이 없으면 출력에도 없습니다.

---

## 해결 방법

### 방법 1: 줄바꿈 유지 (간단, 권장)

#### 개념
선택된 텍스트에서 줄바꿈(`\n`)을 특수 구분자로 변환 → 번역 → 다시 줄바꿈으로 복원

#### 구현

```javascript
// content.js - translate 함수 수정

async function translate(text) {
  // ... 기존 코드 ...

  try {
    // 1. 줄바꿈을 특수 구분자로 변환
    const preservedText = text.replace(/\n/g, '<<<NEWLINE>>>');

    // 2. 번역 요청
    const res = await chrome.runtime.sendMessage({
      action: 'translate',
      text: preservedText,
      targetLang: targetLang
    });

    if (res?.success) {
      // 3. 번역 결과에서 구분자를 다시 줄바꿈으로 변환
      translatedText = res.translatedText.replace(/<<<NEWLINE>>>/g, '\n');

      // 4. HTML로 표시 (줄바꿈을 <br>로)
      el.innerHTML = translatedText.split('\n').join('<br>');
    }
  } catch (error) {
    // ... 에러 처리 ...
  }
}
```

#### 장점
- 구현 간단
- 줄바꿈 완벽 보존
- 기존 API 그대로 사용

#### 단점
- Google Translate가 구분자를 번역할 수 있음
- 들여쓰기는 보존 안 됨

---

### 방법 2: 줄 단위 번역 (정확, 느림)

#### 개념
텍스트를 줄별로 분리 → 각 줄 개별 번역 → 다시 합치기

#### 구현

```javascript
// content.js

async function translate(text) {
  const el = translationPopup.querySelector('#translated-text');
  const uiTexts = getUILanguage(currentUILanguage);

  el.textContent = uiTexts.translating;

  try {
    const settings = await chrome.storage.sync.get(['targetLanguage']);
    const targetLang = settings.targetLanguage || 'ko';

    // 1. 줄 단위로 분리
    const lines = text.split('\n');
    const translatedLines = [];

    // 2. 각 줄 개별 번역
    for (const line of lines) {
      // 빈 줄은 그대로 유지
      if (!line.trim()) {
        translatedLines.push('');
        continue;
      }

      // 번역 요청
      const res = await chrome.runtime.sendMessage({
        action: 'translate',
        text: line,
        targetLang: targetLang
      });

      if (res?.success) {
        translatedLines.push(res.translatedText);
      } else {
        translatedLines.push(line); // 실패 시 원문 유지
      }
    }

    // 3. 다시 합치기
    translatedText = translatedLines.join('\n');

    // 4. HTML로 표시
    el.innerHTML = translatedText.split('\n').join('<br>');

  } catch (error) {
    // ... 에러 처리 ...
  }
}
```

#### 장점
- 각 줄의 의미를 정확히 번역
- 줄바꿈 완벽 보존

#### 단점
- 여러 번 API 호출 (느림)
- 네트워크 부하 증가
- 문맥이 끊길 수 있음

---

### 방법 3: HTML 구조 유지 (복잡, 완벽)

#### 개념
선택 영역의 HTML 구조를 파싱 → 텍스트만 번역 → HTML 구조에 다시 삽입

#### 구현

```javascript
// content.js

async function translate(text) {
  const el = translationPopup.querySelector('#translated-text');
  const uiTexts = getUILanguage(currentUILanguage);

  el.textContent = uiTexts.translating;

  try {
    const settings = await chrome.storage.sync.get(['targetLanguage']);
    const targetLang = settings.targetLanguage || 'ko';

    // 1. 선택된 HTML 구조 가져오기
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const fragment = range.cloneContents();

    // 2. 임시 div에 넣어서 처리
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(fragment);

    // 3. 텍스트 노드만 찾아서 번역
    const textNodes = [];
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim()) {
        textNodes.push(node);
      }
    }

    // 4. 각 텍스트 노드 번역
    for (const textNode of textNodes) {
      const res = await chrome.runtime.sendMessage({
        action: 'translate',
        text: textNode.textContent,
        targetLang: targetLang
      });

      if (res?.success) {
        textNode.textContent = res.translatedText;
      }
    }

    // 5. 번역된 HTML 표시
    translatedText = tempDiv.innerHTML;
    el.innerHTML = translatedText;

  } catch (error) {
    // ... 에러 처리 ...
  }
}
```

#### 장점
- HTML 구조 완벽 보존
- 리스트, 들여쓰기, 스타일 모두 유지
- 가장 정확한 결과

#### 단점
- 구현 복잡
- 여러 번 API 호출
- 성능 이슈

---

### 방법 4: 하이브리드 (권장 절충안)

#### 개념
줄바꿈과 들여쓰기만 보존, HTML 구조는 무시

#### 구현

```javascript
// content.js

async function translate(text) {
  const el = translationPopup.querySelector('#translated-text');
  const uiTexts = getUILanguage(currentUILanguage);

  el.textContent = uiTexts.translating;

  try {
    const settings = await chrome.storage.sync.get(['targetLanguage']);
    const targetLang = settings.targetLanguage || 'ko';

    // 1. 줄 단위로 분리 (들여쓰기 정보 포함)
    const lines = text.split('\n').map(line => {
      // 들여쓰기 공백 개수 세기
      const leadingSpaces = line.match(/^\s*/)[0].length;
      const trimmedLine = line.trim();

      return {
        indent: leadingSpaces,
        text: trimmedLine
      };
    });

    // 2. 빈 줄이 아닌 줄들만 모아서 한 번에 번역
    const nonEmptyLines = lines.filter(l => l.text);
    const textsToTranslate = nonEmptyLines.map(l => l.text).join('\n');

    const res = await chrome.runtime.sendMessage({
      action: 'translate',
      text: textsToTranslate,
      targetLang: targetLang
    });

    if (res?.success) {
      // 3. 번역 결과를 다시 줄 단위로 분리
      const translatedTexts = res.translatedText.split('\n');

      // 4. 들여쓰기 복원
      let translatedIndex = 0;
      const result = lines.map(line => {
        if (!line.text) {
          return ''; // 빈 줄
        }

        const translatedText = translatedTexts[translatedIndex++] || '';
        const indent = '&nbsp;'.repeat(line.indent);

        return indent + translatedText;
      });

      // 5. HTML로 표시
      translatedText = result.join('<br>');
      el.innerHTML = translatedText;
    }

  } catch (error) {
    // ... 에러 처리 ...
  }
}
```

#### 장점
- 줄바꿈 + 들여쓰기 보존
- API 호출 1회 (빠름)
- 구현 중간 난이도

#### 단점
- HTML 태그는 유지 안 됨
- 리스트 마커(•, ✓) 별도 처리 필요

---

## 리스트 마커 보존

### 문제
`✓`, `•`, `-`, `*` 같은 마커가 번역되거나 사라짐

### 해결

```javascript
// content.js

function preserveListMarkers(text) {
  // 리스트 마커 패턴 정의
  const markers = ['✓', '✔', '•', '○', '●', '■', '□', '-', '*', '→', '►'];

  const lines = text.split('\n').map(line => {
    const trimmed = line.trim();

    // 각 마커 확인
    for (const marker of markers) {
      if (trimmed.startsWith(marker)) {
        // 마커와 나머지 텍스트 분리
        const textWithoutMarker = trimmed.substring(marker.length).trim();
        return {
          marker: marker,
          text: textWithoutMarker,
          indent: line.match(/^\s*/)[0].length
        };
      }
    }

    // 마커 없으면 그대로
    return {
      marker: null,
      text: trimmed,
      indent: line.match(/^\s*/)[0].length
    };
  });

  return lines;
}

async function translate(text) {
  // ... 기존 코드 ...

  // 1. 마커 정보 추출
  const linesWithMarkers = preserveListMarkers(text);

  // 2. 텍스트만 번역
  const textsToTranslate = linesWithMarkers
    .map(l => l.text)
    .filter(t => t)
    .join('\n');

  const res = await chrome.runtime.sendMessage({
    action: 'translate',
    text: textsToTranslate,
    targetLang: targetLang
  });

  if (res?.success) {
    const translatedTexts = res.translatedText.split('\n');

    // 3. 마커와 들여쓰기 복원
    let translatedIndex = 0;
    const result = linesWithMarkers.map(line => {
      if (!line.text) return '';

      const translatedText = translatedTexts[translatedIndex++] || '';
      const indent = '&nbsp;'.repeat(line.indent);
      const marker = line.marker ? line.marker + ' ' : '';

      return indent + marker + translatedText;
    });

    el.innerHTML = result.join('<br>');
  }
}
```

---

## 권장 구현 (최종안)

**방법 4 (하이브리드) + 리스트 마커 보존** 조합

### 장점
- 줄바꿈, 들여쓰기, 리스트 마커 모두 보존
- API 호출 1회 (빠름)
- 사용자 경험 크게 개선
- 구현 난이도 적당

### 예상 결과

**원본:**
```
✓ Create unlimited AI agents
✓ Access the full Agent Library
✓ Real-time portfolio management
  ✓ 24/7 automated execution
✓ Full iteration history & smart notifications
```

**번역 후:**
```
✓ 무제한 AI 에이전트 생성
✓ 전체 에이전트 라이브러리에 액세스
✓ 실시간 포트폴리오 관리
  ✓ 연중무휴 자동 실행
✓ 전체 반복 기록 및 스마트 알림
```

---

## 추가 고려사항

### 1. 성능 최적화
```javascript
// 너무 긴 텍스트는 청크로 나누기
const MAX_CHUNK_SIZE = 5000; // 문자

if (text.length > MAX_CHUNK_SIZE) {
  // 줄 단위로 청크 분할
  const chunks = splitIntoChunks(text, MAX_CHUNK_SIZE);

  for (const chunk of chunks) {
    // 각 청크 번역
  }
}
```

### 2. 캐싱
```javascript
// 같은 줄을 반복 번역하지 않도록
const translationCache = new Map();

async function translateWithCache(text, targetLang) {
  const key = `${text}:${targetLang}`;

  if (translationCache.has(key)) {
    return translationCache.get(key);
  }

  const result = await translateText(text, targetLang);
  translationCache.set(key, result);

  return result;
}
```

### 3. 설정 옵션
```javascript
// settings.html에 추가
<label>
  <input type="checkbox" id="preserveFormatting" checked>
  줄바꿈과 들여쓰기 유지
</label>

// 사용자가 원하면 끌 수 있도록
const settings = await chrome.storage.sync.get(['preserveFormatting']);
if (settings.preserveFormatting !== false) {
  // 포맷 유지 로직 실행
}
```

---

## 구현 우선순위

### Phase 1 (필수)
- [x] 기본 번역 기능
- [ ] 줄바꿈 유지 (방법 1 또는 4)

### Phase 2 (중요)
- [ ] 들여쓰기 보존
- [ ] 리스트 마커 보존

### Phase 3 (선택)
- [ ] HTML 구조 유지
- [ ] 번역 캐싱
- [ ] 설정 옵션

---

## 기술적 제약

### Google Translate API 한계
1. **문맥 손실**: 줄 단위 번역 시 전체 문맥을 파악하지 못할 수 있음
2. **마커 번역**: `✓`를 "체크"로 번역할 수 있음
3. **특수 문자**: 일부 특수 문자가 깨질 수 있음

### 해결 방법
- 마커는 번역 전에 제거 후 복원
- 한 번에 번역하되 구분자로 줄 구분
- 특수 문자는 HTML entity 사용

---

## 참고 자료

- [Selection API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Selection)
- [TreeWalker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker)
- [Range.cloneContents() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Range/cloneContents)
- [Google Translate API 비공식 문서](https://stackoverflow.com/questions/26714426/what-is-the-meaning-of-google-translate-query-params)

---

**마지막 업데이트**: 2026-01-12
