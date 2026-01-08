# DragTranslator - Chrome Extension

[한국어](#한국어) | [English](#english)

---

## 한국어

텍스트를 드래그하면 번역 버튼이 자동으로 나타나고, 클릭 시 선택한 언어로 번역 결과를 보여주는 Chrome 확장 프로그램입니다.

**다국어 지원**: 설정에서 원하는 언어를 선택하면 UI와 번역 대상 언어가 모두 해당 언어로 변경됩니다.

## 주요 기능

- **드래그 번역**: 텍스트를 드래그하면 번역 버튼이 자동으로 나타납니다
- **16개 언어 지원**: 설정에서 원하는 번역 대상 언어를 선택할 수 있습니다
- **동적 UI 언어 변경**: 설정에서 선택한 언어로 전체 인터페이스가 즉시 변경됩니다
- **번역 기록 저장**: 번역 결과를 저장하고 나중에 확인할 수 있습니다
- **깔끔한 다크 테마**: 모던하고 직관적인 UI 디자인
- **activeTab 권한**: 설치 시 경고 없이 안전하게 사용
- **무료 API**: Google Translate 무료 API 사용

## 설치 방법

### 1. 저장소 다운로드
```bash
git clone https://github.com/baek0203/DragTranslator.git
cd DragTranslator
```

### 2. Chrome 확장 프로그램으로 로드

1. Chrome 브라우저를 열고 주소창에 `chrome://extensions/` 입력
2. 오른쪽 상단의 "개발자 모드" 토글을 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 버튼 클릭
4. 이 프로젝트 폴더를 선택

## 사용 방법

### 1. 언어 설정
1. 브라우저 툴바의 확장 프로그램 아이콘 클릭 → 번역 기록 화면 표시
2. 우측 상단 **톱니바퀴(⚙️)** 아이콘 클릭 → 메뉴 표시
3. **"설정"** 메뉴 선택 → 언어 설정 화면으로 이동
4. 원하는 언어 선택 (16개 언어 중 선택)
   - UI와 번역 대상 언어가 모두 선택한 언어로 변경됩니다
5. **"저장"** 버튼 클릭 → 설정 저장 및 자동으로 기록 화면으로 복귀

### 2. 텍스트 번역
1. 웹페이지에서 번역하고 싶은 텍스트를 드래그하여 선택
2. 나타나는 **번역 아이콘**(🔤) 버튼 클릭
3. 번역 팝업에서 결과 확인 (설정한 언어로 자동 번역)
4. **"저장"** 버튼: 번역 결과를 기록에 저장
5. **"모든 번역 보기"** 버튼: Google Translate에서 여러 언어 동시 확인

### 3. 기타 메뉴
톱니바퀴 아이콘 클릭 시 표시되는 메뉴:
- **설정**: 언어 설정 화면
- **불편한 점을 알려주세요**: 피드백 폼
- **정보 / 버전**: 확장 프로그램 정보

## 파일 구조

```
DragTranslator/
├── manifest.json        # 확장 프로그램 설정
├── content.js           # UI 렌더링, DOM 조작
├── background.js        # 번역 API 핸들러
├── styles.css           # 번역 UI 스타일
├── popup.html           # 설정 페이지
├── popup.js             # 설정 페이지 로직
├── history.html         # 번역 기록 페이지
├── history.js           # 번역 기록 로직
├── icons/               # 확장 프로그램 아이콘
│   ├── icon16.png       # 16x16 PNG
│   ├── icon48.png       # 48x48 PNG
│   └── icon128.png      # 128x128 PNG
├── _locales/            # 다국어 지원 파일
│   ├── ko/              # 한국어
│   ├── en/              # 영어
│   ├── ja/              # 일본어
│   ├── zh_CN/           # 중국어 간체
│   ├── es/              # 스페인어
│   ├── fr/              # 프랑스어
│   └── de/              # 독일어
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

## 지원 언어

### 번역 대상 언어 (16개)
설정 페이지에서 선택 가능:
- 한국어 (Korean)
- English (영어)
- 日本語 (일본어)
- 中文 간체/번체 (Chinese Simplified/Traditional)
- Español (스페인어)
- Français (프랑스어)
- Deutsch (독일어)
- Русский (러시아어)
- Português (포르투갈어)
- Italiano (이탈리아어)
- العربية (아랍어)
- हिन्दी (힌디어)
- ไทย (태국어)
- Tiếng Việt (베트남어)
- Bahasa Indonesia (인도네시아어)

### 인터페이스 언어 (7개)
브라우저 언어 설정에 따라 자동 선택:
- 한국어 (Korean)
- English (영어)
- 日本語 (일본어)
- 中文 (중국어 간체)
- Español (스페인어)
- Français (프랑스어)
- Deutsch (독일어)

## 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.

- [ ] 사용자 생길시 기능추가
- [ ] 사용자 정의 단축키

---

## English

A Chrome extension that shows a translation button when you drag text, just like Chrome's built-in feature, and displays translation results when clicked.

**Multi-language Support**: This extension automatically changes the interface language based on your browser's language settings.

## Key Features

- **Auto Translation Button on Text Selection**: Translation button automatically appears when you drag text on a webpage
- **Customizable Settings**: Click the extension icon to select your preferred translation language (16 languages supported)
- **Multi-language Support**: Instant translation to Korean, English, Japanese, Chinese, and more
- **Multi-language Interface**: Interface automatically changes based on your browser language
- **Clean UI**: Modern and intuitive translation popup interface
- **Works on All Websites**: Functions on any webpage
- **Free Translation API**: Uses Google Translate free API
- **Save Translation Results**: Save translated results to create your own vocabulary list

## Installation

### 1. Download Repository
```bash
git clone https://github.com/baek0203/DragTranslator.git
cd translator_extention
```

### 2. Load as Chrome Extension

1. Open Chrome browser and enter `chrome://extensions/` in the address bar
2. Enable "Developer mode" toggle in the top right
3. Click "Load unpacked" button
4. Select this project folder

## How to Use

### Change Settings
1. Click the extension icon in the browser toolbar
2. Select your preferred translation language (Korean, English, Japanese, etc. - 16 languages available)
3. Click "Save" button
4. Click "View Translation History" link to see your saved translations

### Translate Text
1. Drag to select the text you want to translate on a webpage
2. Click the **translation icon** button that appears
3. View the translation result in the popup (automatically translated to your selected language)
4. Click "Save" button to save the translation
5. Use "View All Translations" button to see multiple languages on Google Translate

## File Structure

```
DragTranslator/
├── manifest.json        # Extension configuration
├── content.js           # UI rendering, DOM manipulation
├── background.js        # Translation API handler
├── styles.css           # Translation UI styles
├── popup.html           # Settings page
├── popup.js             # Settings page logic
├── history.html         # Translation history page
├── history.js           # Translation history logic
├── icons/               # Extension icons
│   ├── icon16.png       # 16x16 PNG
│   ├── icon48.png       # 48x48 PNG
│   └── icon128.png      # 128x128 PNG
├── _locales/            # Internationalization files
│   ├── ko/              # Korean
│   ├── en/              # English
│   ├── ja/              # Japanese
│   ├── zh_CN/           # Chinese (Simplified)
│   ├── es/              # Spanish
│   ├── fr/              # French
│   └── de/              # German
├── README.md            # This file
└── tech.md              # Technology stack documentation
```

## Technology Stack

- **Manifest V3**: Latest Chrome extension standard
- **Vanilla JavaScript**: Implemented in pure JavaScript
- **Google Translate API**: Free translation service
- **MyMemory API**: Alternative translation service
- **CSS3**: Modern UI styling
- **Chrome i18n API**: Multi-language support
- **popup**: Vocabulary feature

## Key Features Explained

### Text Selection Detection
- Detects text selection using `mouseup` event
- Calculates selected text position to display translation button

### Translation Popup
- Displays original and translated text simultaneously
- Select various languages via tabs
- Smooth animation effects
- Save translation results

### Translation API
- Uses Google Translate free API

## Supported Languages

### Translation Target Languages (16)
Selectable in settings page:
- 한국어 (Korean)
- English
- 日本語 (Japanese)
- 中文 Simplified/Traditional (Chinese)
- Español (Spanish)
- Français (French)
- Deutsch (German)
- Русский (Russian)
- Português (Portuguese)
- Italiano (Italian)
- العربية (Arabic)
- हिन्दी (Hindi)
- ไทย (Thai)
- Tiếng Việt (Vietnamese)
- Bahasa Indonesia (Indonesian)

### Interface Languages (7)
Automatically selected based on browser language:
- 한국어 (Korean)
- English
- 日本語 (Japanese)
- 中文 (Chinese Simplified)
- Español (Spanish)
- Français (French)
- Deutsch (German)

## Customization

### Change Default Translation Language
Simply click the extension icon and select your preferred language in the settings page. No code modification needed!

Supported language codes:
- `ko` - Korean
- `en` - English
- `ja` - Japanese
- `zh-CN` - Chinese (Simplified)
- `zh-TW` - Chinese (Traditional)
- `es` - Spanish
- `fr` - French
- `de` - German
- And more...

### Style Modification
You can customize button colors, popup size, etc. in [styles.css](styles.css).

## Troubleshooting

### If Translation Doesn't Work
1. **Refresh the page** (F5)
2. Check if the extension is enabled on the Chrome extensions page
3. Check Service Worker status: `chrome://extensions/` → Click Service Worker link

### If Translation Button Doesn't Appear
1. Check if you've selected enough text (more than 0 characters, less than 5000)
2. Check if you've refreshed the page (required after extension update)
3. Check for error messages in browser console (F12)

### Errors on SPA Sites like X.com, YouTube
**Symptom**: "Cannot set properties of null" error
**Cause**: DOM removal during page transitions in SPAs
**Solution**: Manually refresh the page (F5)

The current version includes SPA DOM removal defense logic and handles most cases automatically.

## Developer Information

- **Development Environment**: Chrome Extension Manifest V3
- **Tested Browser**: Chrome 88+

## License

MIT License

## Contributing

Please register bug reports or feature suggestions as issues.

- [ ] Add features when users appear
- [ ] Custom keyboard shortcuts
