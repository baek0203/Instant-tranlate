// 지원 언어 목록
const LANGUAGES = [
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文(简体)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文(繁體)' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' }
];

let selectedLanguage = 'ko'; // 기본값
let currentUILanguage = 'en'; // 현재 UI 언어

// i18n.js에서 가져온 함수들을 사용하기 위해 스크립트 로드 확인
function waitForI18n() {
  return new Promise((resolve) => {
    if (typeof getUILanguage !== 'undefined') {
      resolve();
    } else {
      setTimeout(() => waitForI18n().then(resolve), 50);
    }
  });
}

// UI 언어로 메시지 로드
function loadI18nMessages(langCode) {
  currentUILanguage = langCode;
  const translations = getUILanguage(langCode);

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const message = translations[key];
    if (message) {
      element.textContent = message;
    }
  });
}

// 언어 그리드 생성
function createLanguageGrid() {
  const grid = document.getElementById('language-grid');

  LANGUAGES.forEach(lang => {
    const option = document.createElement('div');
    option.className = 'language-option';
    option.dataset.lang = lang.code;

    option.innerHTML = `
      <input type="radio" name="language" value="${lang.code}" id="lang-${lang.code}">
      <label class="language-label" for="lang-${lang.code}">
        ${lang.nativeName}
        <div class="language-code">${lang.code}</div>
      </label>
    `;

    option.addEventListener('click', () => {
      selectLanguage(lang.code);
    });

    grid.appendChild(option);
  });
}

// 언어 선택
function selectLanguage(langCode) {
  selectedLanguage = langCode;

  // UI 언어도 함께 변경
  loadI18nMessages(langCode);

  // 모든 옵션에서 selected 클래스 제거
  document.querySelectorAll('.language-option').forEach(opt => {
    opt.classList.remove('selected');
  });

  // 선택된 옵션에 selected 클래스 추가
  const selectedOption = document.querySelector(`[data-lang="${langCode}"]`);
  if (selectedOption) {
    selectedOption.classList.add('selected');
    selectedOption.querySelector('input').checked = true;
  }
}

// 설정 로드
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['targetLanguage', 'uiLanguage']);
    const targetLang = result.targetLanguage || 'ko';
    const uiLang = result.uiLanguage || targetLang;

    // UI 언어 먼저 적용
    currentUILanguage = uiLang;
    loadI18nMessages(uiLang);

    // 번역 대상 언어 선택
    selectLanguage(targetLang);
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

// 설정 저장
async function saveSettings() {
  try {
    await chrome.storage.sync.set({
      targetLanguage: selectedLanguage,
      uiLanguage: selectedLanguage // UI 언어도 함께 저장
    });
    showStatusMessage();
  } catch (error) {
    console.error('Failed to save settings:', error);
    const translations = getUILanguage(currentUILanguage);
    alert(translations.saveFailed || 'Failed to save settings');
  }
}

// 기본값으로 리셋
async function resetToDefault() {
  selectLanguage('ko');
  await saveSettings();
}

// 상태 메시지 표시
function showStatusMessage() {
  const message = document.getElementById('status-message');
  message.classList.add('show');

  setTimeout(() => {
    message.classList.remove('show');
  }, 2000);
}

// 번역 기록 페이지 열기
function openHistory() {
  chrome.tabs.create({
    url: chrome.runtime.getURL('history.html')
  });
}

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', async () => {
  await waitForI18n(); // i18n.js 로드 대기

  createLanguageGrid();
  await loadSettings();

  document.getElementById('save-btn').addEventListener('click', saveSettings);
  document.getElementById('reset-btn').addEventListener('click', resetToDefault);
  document.getElementById('view-history').addEventListener('click', openHistory);
});
