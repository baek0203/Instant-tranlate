# Instant Translate - Chrome Extension

[한국어](#한국어) | [English](#english)

---

## 한국어

텍스트를 드래그하면 번역 버튼이 자동으로 나타나고, 클릭 시 선택한 언어로 번역 결과를 보여주는 Chrome 확장 프로그램입니다.

## 주요 기능

- **드래그 번역**: 텍스트를 드래그하면 번역 버튼이 자동으로 나타납니다
- **단어장 대시보드**: 저장한 단어와 문장을 한눈에 볼 수 있는 대시보드
- **딥링크 기능**: 저장된 단어 클릭 시 원본 페이지로 이동하여 해당 텍스트 하이라이트
- **다크/라이트 테마**: 시스템 설정 또는 수동으로 테마 선택 가능
- **글꼴 크기 조절**: 단어장 텍스트 크기를 사용자 취향에 맞게 조절
- **16개 번역 언어 지원**: 다양한 언어로 번역 가능
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
4. 다운로드한 폴더를 선택

## 사용 방법

### 1. 텍스트 번역
1. 웹페이지에서 번역하고 싶은 텍스트를 드래그하여 선택
2. 나타나는 **번역 아이콘** 버튼 클릭
3. 번역 팝업에서 결과 확인
4. **"저장"** 버튼: 번역 결과를 단어장에 저장

### 2. 단어장 대시보드
1. 브라우저 툴바의 확장 프로그램 아이콘 클릭
2. 대시보드가 새 탭에서 열림
3. **Vocabulary**: 저장된 단어(왼쪽)와 문장(오른쪽) 확인
4. **Settings**: 번역 언어, UI 언어, 테마, 글꼴 크기 설정
5. **Information**: 버전 정보 및 문의하기

### 3. 딥링크 기능
- 단어장에서 저장된 항목의 소스 링크 클릭
- 원본 페이지로 이동하여 해당 텍스트가 자동으로 하이라이트됨
- Ctrl+F로 검색한 것과 동일한 효과

## 파일 구조

```
InstantTranslate/
├── manifest.json           # 확장 프로그램 설정
├── dashboard.html          # 메인 대시보드 페이지
├── src/
│   ├── background.js       # 서비스 워커 (번역 API, 아이콘 클릭 핸들러)
│   ├── content.js          # 메인 콘텐츠 스크립트
│   ├── styles.css          # 번역 팝업 스타일
│   ├── content/            # 콘텐츠 스크립트 모듈
│   │   ├── button.js       # 번역 버튼 UI
│   │   ├── popup.js        # 번역 팝업 UI
│   │   ├── translate.js    # 번역 요청 처리
│   │   ├── save.js         # 번역 결과 저장
│   │   ├── highlight.js    # 텍스트 하이라이트 (딥링크)
│   │   └── deeplink.js     # 딥링크 URL 파라미터 처리
│   ├── dashboard/          # 대시보드 모듈
│   │   ├── dashboard.js    # 대시보드 초기화
│   │   ├── dashboard.css   # 대시보드 스타일
│   │   ├── core/           # 핵심 유틸리티
│   │   │   ├── utils.js    # 공용 유틸리티 함수
│   │   │   ├── navigation.js # 탭 네비게이션
│   │   │   └── theme.js    # 테마 관리
│   │   ├── vocabulary/     # 단어장 모듈
│   │   │   └── vocabulary.js
│   │   ├── settings/       # 설정 모듈
│   │   │   └── settings.js
│   │   └── info/           # 정보 모듈
│   │       └── info.js
│   └── shared/             # 공유 모듈
│       ├── i18n.js         # 다국어 지원
│       ├── settings-store.js   # 설정 저장소
│       └── translation-store.js # 번역 기록 저장소
├── _locales/               # 다국어 메시지 (7개 언어)
│   ├── en/, ko/, ja/, zh_CN/, es/, fr/, de/
├── icons/                  # 확장 프로그램 아이콘
└── docs/                   # 문서
```

## 기술 스택

- **Manifest V3**: 최신 Chrome 확장 프로그램 표준
- **Vanilla JavaScript**: 프레임워크 없이 순수 자바스크립트 구현
- **CSS Variables**: 다크/라이트 테마 지원
- **Chrome Storage API**: 설정 및 번역 기록 저장
- **Google Translate API**: 무료 번역 서비스

## 지원 언어

### 번역 대상 언어 (16개)
한국어, English, 日本語, 中文(간체/번체), Español, Français, Deutsch, Русский, Português, Italiano, العربية, हिन्दी, ไทย, Tiếng Việt, Bahasa Indonesia

### 인터페이스 언어 (7개)
한국어, English, 日本語, 中文(간체), Español, Français, Deutsch

## 문제 해결

### 번역이 작동하지 않는 경우
1. 페이지를 새로고침하세요 (F5)
2. 확장 프로그램이 활성화되어 있는지 확인

### 딥링크가 작동하지 않는 경우
1. 원본 페이지의 콘텐츠가 변경되었을 수 있습니다
2. 페이지가 로드된 후 잠시 기다려주세요

## 라이선스

MIT License

---

## English

A Chrome extension that automatically shows a translation button when you drag text and displays translation results in your selected language.

## Key Features

- **Drag Translation**: Translation button appears automatically when you drag text
- **Vocabulary Dashboard**: View saved words and sentences in a clean dashboard
- **Deeplink Feature**: Click saved items to navigate to the original page with text highlighted
- **Dark/Light Theme**: Choose between system preference, light, or dark theme
- **Font Size Control**: Adjust vocabulary text size to your preference
- **16 Translation Languages**: Support for various languages
- **Free API**: Uses Google Translate free API

## Installation

### 1. Download Repository
```bash
git clone https://github.com/baek0203/DragTranslator.git
cd DragTranslator
```

### 2. Load as Chrome Extension

1. Open Chrome browser and enter `chrome://extensions/` in the address bar
2. Enable "Developer mode" toggle in the top right
3. Click "Load unpacked" button
4. Select the downloaded folder

## How to Use

### 1. Translate Text
1. Drag to select text you want to translate on a webpage
2. Click the **translation icon** button that appears
3. View the translation result in the popup
4. **"Save"** button: Save the translation to your vocabulary

### 2. Vocabulary Dashboard
1. Click the extension icon in the browser toolbar
2. Dashboard opens in a new tab
3. **Vocabulary**: View saved words (left) and sentences (right)
4. **Settings**: Configure translation language, UI language, theme, font size
5. **Information**: Version info and contact form

### 3. Deeplink Feature
- Click the source link on any saved vocabulary item
- Navigate to the original page with the text automatically highlighted
- Works like Ctrl+F search

## File Structure

```
InstantTranslate/
├── manifest.json           # Extension configuration
├── dashboard.html          # Main dashboard page
├── src/
│   ├── background.js       # Service worker (translation API, icon click handler)
│   ├── content.js          # Main content script
│   ├── styles.css          # Translation popup styles
│   ├── content/            # Content script modules
│   │   ├── button.js       # Translation button UI
│   │   ├── popup.js        # Translation popup UI
│   │   ├── translate.js    # Translation request handling
│   │   ├── save.js         # Save translation results
│   │   ├── highlight.js    # Text highlighting (deeplink)
│   │   └── deeplink.js     # Deeplink URL parameter handling
│   ├── dashboard/          # Dashboard modules
│   │   ├── dashboard.js    # Dashboard initialization
│   │   ├── dashboard.css   # Dashboard styles
│   │   ├── core/           # Core utilities
│   │   │   ├── utils.js    # Shared utility functions
│   │   │   ├── navigation.js # Tab navigation
│   │   │   └── theme.js    # Theme management
│   │   ├── vocabulary/     # Vocabulary module
│   │   │   └── vocabulary.js
│   │   ├── settings/       # Settings module
│   │   │   └── settings.js
│   │   └── info/           # Info module
│   │       └── info.js
│   └── shared/             # Shared modules
│       ├── i18n.js         # Internationalization
│       ├── settings-store.js   # Settings storage
│       └── translation-store.js # Translation history storage
├── _locales/               # Localization messages (7 languages)
│   ├── en/, ko/, ja/, zh_CN/, es/, fr/, de/
├── icons/                  # Extension icons
└── docs/                   # Documentation
```

## Technology Stack

- **Manifest V3**: Latest Chrome extension standard
- **Vanilla JavaScript**: Pure JavaScript without frameworks
- **CSS Variables**: Dark/Light theme support
- **Chrome Storage API**: Settings and translation history storage
- **Google Translate API**: Free translation service

## Supported Languages

### Translation Target Languages (16)
Korean, English, Japanese, Chinese (Simplified/Traditional), Spanish, French, German, Russian, Portuguese, Italian, Arabic, Hindi, Thai, Vietnamese, Indonesian

### Interface Languages (7)
Korean, English, Japanese, Chinese (Simplified), Spanish, French, German

## Troubleshooting

### If Translation Doesn't Work
1. Refresh the page (F5)
2. Check if the extension is enabled

### If Deeplink Doesn't Work
1. The original page content may have changed
2. Wait a moment after the page loads

## License

MIT License
