// Dashboard Settings Module

const Settings = {
  // Translation languages
  TRANSLATION_LANGUAGES: [
    { code: 'ko', name: '한국어' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'zh-CN', name: '中文(简体)' },
    { code: 'zh-TW', name: '中文(繁體)' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ru', name: 'Русский' },
    { code: 'pt', name: 'Português' },
    { code: 'it', name: 'Italiano' },
    { code: 'ar', name: 'العربية' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'th', name: 'ไทย' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'hi', name: 'हिन्दी' }
  ],

  // UI languages (based on available locales)
  UI_LANGUAGES: [
    { code: 'en', name: 'English' },
    { code: 'ko', name: '한국어' },
    { code: 'ja', name: '日本語' },
    { code: 'zh_CN', name: '中文(简体)' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' }
  ],

  init() {
    this.targetLangSelect = document.getElementById('target-language');
    this.secondLangSelect = document.getElementById('second-language');
    this.uiLangSelect = document.getElementById('ui-language');
    this.themeSelect = document.getElementById('theme-select');
    this.fontSizeSelect = document.getElementById('font-size-select');

    this.populateSelects();
    this.loadSettings();
    this.bindEvents();
  },

  populateSelects() {
    // Populate translation language dropdowns
    this.TRANSLATION_LANGUAGES.forEach(lang => {
      if (this.targetLangSelect) {
        this.targetLangSelect.add(new Option(lang.name, lang.code));
      }
      if (this.secondLangSelect) {
        this.secondLangSelect.add(new Option(lang.name, lang.code));
      }
    });

    // Populate UI language dropdown
    this.UI_LANGUAGES.forEach(lang => {
      if (this.uiLangSelect) {
        this.uiLangSelect.add(new Option(lang.name, lang.code));
      }
    });
  },

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'targetLanguage',
        'secondLanguage',
        'uiLanguage',
        'theme',
        'fontSize'
      ]);

      if (this.targetLangSelect) {
        this.targetLangSelect.value = result.targetLanguage || 'ko';
      }
      if (this.secondLangSelect) {
        this.secondLangSelect.value = result.secondLanguage || 'en';
      }
      if (this.uiLangSelect) {
        this.uiLangSelect.value = result.uiLanguage || 'en';
      }
      if (this.themeSelect) {
        this.themeSelect.value = result.theme || 'auto';
      }
      if (this.fontSizeSelect) {
        const fontSize = result.fontSize || '18';
        this.fontSizeSelect.value = fontSize;
        this.applyFontSize(fontSize);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  bindEvents() {
    // Auto-save on change
    this.targetLangSelect?.addEventListener('change', () => this.saveTargetLanguage());
    this.secondLangSelect?.addEventListener('change', () => this.saveSecondLanguage());
    this.uiLangSelect?.addEventListener('change', () => this.saveUiLanguage());
    this.themeSelect?.addEventListener('change', () => this.saveTheme());
    this.fontSizeSelect?.addEventListener('change', () => this.saveFontSize());
  },

  async saveTargetLanguage() {
    const value = this.targetLangSelect?.value;
    if (!value) return;

    try {
      await chrome.storage.sync.set({ targetLanguage: value });
      DashboardUtils.showToast(DashboardUtils.getMessage('settingsSaved') || 'Settings saved');
    } catch (error) {
      console.error('Failed to save target language:', error);
    }
  },

  async saveSecondLanguage() {
    const value = this.secondLangSelect?.value;
    if (!value) return;

    try {
      await chrome.storage.sync.set({ secondLanguage: value });
      DashboardUtils.showToast(DashboardUtils.getMessage('settingsSaved') || 'Settings saved');
    } catch (error) {
      console.error('Failed to save second language:', error);
    }
  },

  async saveUiLanguage() {
    const value = this.uiLangSelect?.value;
    if (!value) return;

    try {
      await chrome.storage.sync.set({ uiLanguage: value });
      DashboardUtils.showToast(DashboardUtils.getMessage('settingsSaved') || 'Settings saved');

      // Note: Full UI language change would require page reload
      // For now, just save the preference
      setTimeout(() => {
        if (confirm(DashboardUtils.getMessage('reloadToApply') || 'Reload page to apply language change?')) {
          window.location.reload();
        }
      }, 500);
    } catch (error) {
      console.error('Failed to save UI language:', error);
    }
  },

  async saveTheme() {
    const value = this.themeSelect?.value;
    if (!value) return;

    try {
      await Theme.setTheme(value);
      DashboardUtils.showToast(DashboardUtils.getMessage('settingsSaved') || 'Settings saved');
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  },

  async saveFontSize() {
    const value = this.fontSizeSelect?.value;
    if (!value) return;

    try {
      await chrome.storage.sync.set({ fontSize: value });
      this.applyFontSize(value);
      DashboardUtils.showToast(DashboardUtils.getMessage('settingsSaved') || 'Settings saved');
    } catch (error) {
      console.error('Failed to save font size:', error);
    }
  },

  applyFontSize(size) {
    document.documentElement.style.setProperty('--vocab-font-size', `${size}px`);
  }
};

// Make it globally available
window.Settings = Settings;
