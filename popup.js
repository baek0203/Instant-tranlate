// 전역 상태
let isSelectMode = false;
let selectedIds = new Set();
let currentUILanguage = 'en';
let selectedLanguage = 'ko';
let isSettingsView = false;

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

// i18n 메시지 로드
async function loadI18nMessages() {
  // 저장된 UI 언어 가져오기
  const result = await chrome.storage.sync.get(['uiLanguage', 'targetLanguage']);
  const uiLang = result.uiLanguage || result.targetLanguage || 'en';
  currentUILanguage = uiLang;

  const translations = getUILanguage(uiLang);

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const message = translations[key];
    if (message) {
      element.textContent = message;
    }
  });
}

// 번역 기록 로드
async function loadTranslations() {
  const container = document.getElementById('container');
  const uiTexts = getUILanguage(currentUILanguage);

  try {
    const result = await chrome.storage.local.get(['translations']);
    const translations = result.translations || [];

    if (translations.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
          </svg>
          <p>${uiTexts.noTranslationsStored}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = translations.map(item => `
      <div class="translation-item" data-id="${item.id}">
        <input type="checkbox" class="select-checkbox" data-id="${item.id}" />
        <div class="item-wrapper">
          <div class="item-header">
            <span class="item-date">${item.date}</span>
            <div class="item-actions">
              <button class="item-btn copy-btn" data-text="${escapeHtml(item.translated)}">${uiTexts.copy}</button>
              <button class="item-btn delete delete-btn" data-id="${item.id}">${uiTexts.delete}</button>
            </div>
          </div>
          <div class="item-content">
            <div class="toggle-header">
              <button class="toggle-btn">
                <svg class="toggle-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 17l5-5-5-5v10z"/>
                </svg>
              </button>
              <div class="text-content original collapsed">${escapeHtml(item.original)}</div>
            </div>
            <div class="text-section translated-section" style="display: none;">
              <div class="text-label">${uiTexts.translation}</div>
              <div class="text-content translated">${escapeHtml(item.translated)}</div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // 토글 버튼 이벤트
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = btn.closest('.translation-item');
        const translatedSection = item.querySelector('.translated-section');
        const icon = btn.querySelector('.toggle-icon');
        const isExpanded = translatedSection.style.display !== 'none';

        if (isExpanded) {
          translatedSection.style.display = 'none';
          icon.style.transform = 'rotate(0deg)';
        } else {
          translatedSection.style.display = 'block';
          icon.style.transform = 'rotate(90deg)';
        }
      });
    });

    // 복사 버튼 이벤트
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = e.target.getAttribute('data-text');
        copyToClipboard(text, btn);
      });
    });

    // 삭제 버튼 이벤트
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        deleteTranslation(id);
      });
    });

    // 체크박스 이벤트
    document.querySelectorAll('.select-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));

        if (e.target.checked) {
          selectedIds.add(id);
        } else {
          selectedIds.delete(id);
        }

        updateActionBar();
      });
    });

  } catch (error) {
    console.error('Failed to load translations:', error);
    const uiTexts = getUILanguage(currentUILanguage);
    container.innerHTML = `<div class="empty-state"><p>${uiTexts.dataLoadError || 'Error loading data'}</p></div>`;
  }
}

// HTML 이스케이프
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 클립보드에 복사
async function copyToClipboard(text, button) {
  const uiTexts = getUILanguage(currentUILanguage);
  try {
    await navigator.clipboard.writeText(text);
    const originalText = button.textContent;
    button.textContent = uiTexts.copied;
    setTimeout(() => {
      button.textContent = originalText;
    }, 1500);
  } catch (error) {
    console.error('Copy failed:', error);
    alert(uiTexts.copyFailed || 'Failed to copy');
  }
}

// 개별 항목 삭제
async function deleteTranslation(id) {
  const uiTexts = getUILanguage(currentUILanguage);
  if (!confirm(uiTexts.confirmDelete || 'Delete this translation?')) {
    return;
  }

  try {
    const result = await chrome.storage.local.get(['translations']);
    const translations = result.translations || [];
    const filtered = translations.filter(item => item.id !== id);

    await chrome.storage.local.set({ translations: filtered });
    loadTranslations();
  } catch (error) {
    console.error('Delete failed:', error);
    alert(uiTexts.deleteFailed || 'Failed to delete');
  }
}

// 전체 삭제
async function clearAllTranslations() {
  const uiTexts = getUILanguage(currentUILanguage);
  if (!confirm(uiTexts.confirmDeleteAll || 'Delete all translations?')) {
    return;
  }

  try {
    await chrome.storage.local.set({ translations: [] });
    loadTranslations();
  } catch (error) {
    console.error('Delete all failed:', error);
    alert(uiTexts.deleteFailed || 'Failed to delete');
  }
}

// JSON 내보내기
async function exportTranslations() {
  const uiTexts = getUILanguage(currentUILanguage);
  try {
    const result = await chrome.storage.local.get(['translations']);
    const translations = result.translations || [];

    if (translations.length === 0) {
      alert(uiTexts.noExportData || 'No data to export');
      return;
    }

    const dataStr = JSON.stringify(translations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `translations_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
    alert(uiTexts.exportFailed || 'Failed to export');
  }
}

// 선택 모드 토글
function toggleSelectMode() {
  const uiTexts = getUILanguage(currentUILanguage);
  const container = document.getElementById('container');
  const header = document.querySelector('.header');
  const selectModeBtn = document.getElementById('select-mode-btn');

  isSelectMode = !isSelectMode;
  selectedIds.clear();

  if (isSelectMode) {
    container.classList.add('select-mode');
    header.classList.add('select-mode-active');
    selectModeBtn.textContent = uiTexts.cancel;
  } else {
    container.classList.remove('select-mode');
    header.classList.remove('select-mode-active');
    selectModeBtn.textContent = uiTexts.select;

    // 모든 체크박스 해제
    document.querySelectorAll('.select-checkbox').forEach(cb => {
      cb.checked = false;
    });
  }

  updateActionBar();
}

// 액션 바 업데이트
function updateActionBar() {
  const uiTexts = getUILanguage(currentUILanguage);
  const actionBar = document.getElementById('action-bar');
  const selectedCount = document.getElementById('selected-count');

  if (isSelectMode && selectedIds.size > 0) {
    actionBar.classList.remove('hidden');
    selectedCount.textContent = uiTexts.selectedCount ?
      uiTexts.selectedCount.replace('$COUNT$', selectedIds.size.toString()) :
      `${selectedIds.size} selected`;
  } else {
    actionBar.classList.add('hidden');
  }
}

// 전체선택 토글
async function toggleSelectAll() {
  try {
    const result = await chrome.storage.local.get(['translations']);
    const translations = result.translations || [];
    const allIds = translations.map(item => item.id);

    // 모두 선택되어 있으면 해제, 아니면 전체 선택
    const allSelected = allIds.every(id => selectedIds.has(id));

    if (allSelected) {
      // 전체 해제
      selectedIds.clear();
      document.querySelectorAll('.select-checkbox').forEach(cb => {
        cb.checked = false;
      });
    } else {
      // 전체 선택
      selectedIds = new Set(allIds);
      document.querySelectorAll('.select-checkbox').forEach(cb => {
        cb.checked = true;
      });
    }

    updateActionBar();
  } catch (error) {
    console.error('전체선택 실패:', error);
  }
}

// 선택된 항목 삭제
async function deleteSelected() {
  if (selectedIds.size === 0) return;

  if (!confirm(chrome.i18n.getMessage('confirmDeleteSelected', [selectedIds.size.toString()]))) {
    return;
  }

  try {
    const result = await chrome.storage.local.get(['translations']);
    const translations = result.translations || [];
    const filtered = translations.filter(item => !selectedIds.has(item.id));

    await chrome.storage.local.set({ translations: filtered });

    selectedIds.clear();
    loadTranslations();
    updateActionBar();
  } catch (error) {
    console.error('Delete selected failed:', error);
    alert(chrome.i18n.getMessage('deleteFailed'));
  }
}

// 설정 화면 표시/숨김
function toggleSettings() {
  const container = document.getElementById('container');
  const settingsView = document.getElementById('settings-view');
  const actionBar = document.getElementById('action-bar');
  const header = document.querySelector('.header h1');
  const uiTexts = getUILanguage(currentUILanguage);

  isSettingsView = !isSettingsView;

  if (isSettingsView) {
    // 설정 화면 표시
    container.classList.add('hidden');
    actionBar.classList.add('hidden');
    settingsView.classList.remove('hidden');
    header.textContent = uiTexts.settings || 'Settings';

    // 언어 그리드 생성
    createLanguageGrid();
    loadSettingsData();
  } else {
    // 번역 기록 화면 표시
    settingsView.classList.add('hidden');
    container.classList.remove('hidden');
    header.textContent = uiTexts.translationHistory || 'Translation History';

    // 번역 기록 다시 로드 (UI 언어가 변경되었을 수 있음)
    loadTranslations();
  }
}

// 언어 그리드 생성
function createLanguageGrid() {
  const grid = document.getElementById('language-grid');
  grid.innerHTML = '';

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
  currentUILanguage = langCode;
  loadI18nMessages();

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

// 설정 데이터 로드
async function loadSettingsData() {
  try {
    const result = await chrome.storage.sync.get(['targetLanguage', 'uiLanguage']);
    const targetLang = result.targetLanguage || 'ko';
    selectedLanguage = targetLang;
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
      uiLanguage: selectedLanguage
    });
    showStatusMessage();

    // 설정 저장 후 번역 기록 화면으로 돌아가기
    setTimeout(() => {
      toggleSettings();
    }, 1500);
  } catch (error) {
    console.error('Failed to save settings:', error);
    const uiTexts = getUILanguage(currentUILanguage);
    alert(uiTexts.saveFailed || 'Failed to save settings');
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

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
  loadI18nMessages();
  loadTranslations();

  document.getElementById('select-mode-btn').addEventListener('click', toggleSelectMode);
  document.getElementById('select-all-btn').addEventListener('click', toggleSelectAll);
  document.getElementById('clear-btn').addEventListener('click', deleteSelected);
  document.getElementById('export-btn').addEventListener('click', exportTranslations);
  document.getElementById('delete-selected-btn').addEventListener('click', deleteSelected);
  document.getElementById('cancel-select-btn').addEventListener('click', toggleSelectMode);

  // 설정 버튼
  document.getElementById('settings-btn').addEventListener('click', openSettings);
});
