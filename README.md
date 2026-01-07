
# translator_extension

# 텍스트 번역기 Chrome Extension

Chrome에 내장된 기능처럼 텍스트를 드래그하면 번역 버튼이 나타나고, 클릭 시 번역 결과를 보여주는 확장 프로그램입니다.

## 주요 기능

- **텍스트 선택 시 자동 번역 버튼 표시**: 웹페이지의 텍스트를 드래그하면 번역 버튼이 자동으로 나타납니다
- **다국어 지원**: 한국어, 영어, 일본어 등 여러 언어로 즉시 번역
- **깔끔한 UI**: 모던하고 직관적인 번역 팝업 인터페이스
- **모든 웹사이트 지원**: 모든 웹페이지에서 작동
- **무료 번역 API 사용**: Google Translate 무료 API 활용
- **번역 결과 저장** : 번역된 결과를 저장하여 단어장으로 만들 수 있습니다.

## 설치 방법

### 1. 저장소 다운로드
```bash
git clone <repository-url>
cd translator_extention
```

### 2. Chrome 확장 프로그램으로 로드

1. Chrome 브라우저를 열고 주소창에 `chrome://extensions/` 입력
2. 오른쪽 상단의 "개발자 모드" 토글을 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 버튼 클릭
4. 이 프로젝트 폴더를 선택

## 사용 방법

1. 웹페이지에서 번역하고 싶은 텍스트를 드래그하여 선택
2. 나타나는 **아이콘** 버튼 클릭
3. 번역 팝업에서 결과 확인
4. 상단 탭을 클릭하여 다른 언어로 변경 가능
5. "모든 번역 보기" 버튼으로 여러 언어 동시 확인

## 파일 구조

```
translator_extention/
├── manifest.json          # 확장 프로그램 설정 
├── content.js            # UI 렌더링, DOM 조작 
├── background.js         # 번역 API 핸들러 
├── styles.css           # 번역 UI 스타일 
├── icons/               # 확장 프로그램 아이콘
│   ├── icon16.png       # 16x16 PNG
│   ├── icon48.png       # 48x48 PNG
│   └── icon128.png      # 128x128 PNG
├── README.md            # 이 파일
└── tech.md              # 기술 스택 문서
```

## 기술 스택

- **Manifest V3**: 최신 Chrome 확장 프로그램 표준
- **Vanilla JavaScript**: 순수 자바스크립트로 구현
- **Google Translate API**: 무료 번역 서비스
- **MyMemory API**: 대체 번역 서비스
- **CSS3**: 모던 UI 스타일링
- **popup**: 단어장 기능 제공

## 주요 기능 설명

### 텍스트 선택 감지
- `mouseup` 이벤트로 텍스트 선택 감지
- 선택된 텍스트의 위치를 계산하여 번역 버튼 표시

### 번역 팝업
- 원문과 번역문을 동시에 표시
- 탭으로 다양한 언어 선택 가능
- 부드러운 애니메이션 효과
- 번역 결과 저장
 
### 번역 API
- Google Translate 무료 API 사용

## 지원 언어 (maybe not all)

- 한국어 (ko)
- English (en)
- 日本語 (ja)
- 中文 (zh-CN)
- Español (es)
- Français (fr)
- Deutsch (de)
- Русский (ru)
- العربية (ar)
- Português (pt)
- Italiano (it)
- ไทย (th)
- Tiếng Việt (vi)
- Bahasa Indonesia (id)
- हिन्दी (hi)

## 커스터마이징

### 기본 번역 언어 변경
`background.js`에서 기본 설정을 수정할 수 있습니다:

```javascript
chrome.storage.sync.set({
  defaultTargetLang: 'ko',  // 원하는 언어 코드로 변경
  autoDetect: true,
  showAllTranslations: false
});
```

### 스타일 수정
`styles.css`에서 버튼 색상, 팝업 크기 등을 커스터마이징할 수 있습니다.

## 문제 해결

### 번역이 작동하지 않는 경우
1. **페이지를 새로고침하세요** (F5)
2. Chrome 확장 프로그램 페이지에서 확장 프로그램이 활성화되어 있는지 확인
3. Service Worker 상태 확인: `chrome://extensions/` → Service Worker 링크 클릭

### 번역 버튼이 나타나지 않는 경우
1. 텍스트를 충분히 선택했는지 확인 (0자 초과, 5000자 미만)
2. 페이지를 새로고침했는지 확인 (확장 프로그램 업데이트 후 필수)
3. 브라우저 콘솔(F12)에서 에러 메시지 확인

### X.com, YouTube 등 SPA 사이트에서 오류 발생
**증상**: "Cannot set properties of null" 오류
**원인**: SPA에서 페이지 전환 시 DOM 제거
**해결**: 페이지를 수동으로 새로고침(F5)하면 해결됨

현재 버전은 SPA DOM 제거 방어 로직이 포함되어 있어 대부분의 경우 자동으로 처리됩니다.

## 개발자 정보

- **개발 환경**: Chrome Extension Manifest V3
- **테스트 브라우저**: Chrome 88+

## 라이선스

MIT License

## 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.

- [ ] 사용자 생길시 기능추가
- [ ] 사용자 정의 단축키
