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

  // Original settings (for cancel functionality)
  originalSettings: {},
  // Track if settings have changed
  hasChanges: false,

  init() {
    this.targetLangSelect = document.getElementById('target-language');
    this.secondLangSelect = document.getElementById('second-language');
    this.uiLangSelect = document.getElementById('ui-language');
    this.themeSelect = document.getElementById('theme-select');
    this.saveBtn = document.getElementById('settings-save-btn');
    this.cancelBtn = document.getElementById('settings-cancel-btn');

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
        'theme'
      ]);

      // Store original values
      this.originalSettings = {
        targetLanguage: result.targetLanguage || 'ko',
        secondLanguage: result.secondLanguage || 'en',
        uiLanguage: result.uiLanguage || 'en',
        theme: result.theme || 'auto'
      };

      // Apply to selects
      if (this.targetLangSelect) {
        this.targetLangSelect.value = this.originalSettings.targetLanguage;
      }
      if (this.secondLangSelect) {
        this.secondLangSelect.value = this.originalSettings.secondLanguage;
      }
      if (this.uiLangSelect) {
        this.uiLangSelect.value = this.originalSettings.uiLanguage;
      }
      if (this.themeSelect) {
        this.themeSelect.value = this.originalSettings.theme;
      }

      this.hasChanges = false;
      this.updateButtonStates();
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  bindEvents() {
    // Track changes on all selects
    this.targetLangSelect?.addEventListener('change', () => this.onSettingChange());
    this.secondLangSelect?.addEventListener('change', () => this.onSettingChange());
    this.uiLangSelect?.addEventListener('change', () => this.onSettingChange());
    this.themeSelect?.addEventListener('change', () => this.onSettingChange());

    // Save button
    this.saveBtn?.addEventListener('click', () => this.saveSettings());

    // Cancel button
    this.cancelBtn?.addEventListener('click', () => this.cancelChanges());
  },

  onSettingChange() {
    // Check if any value differs from original
    const currentSettings = this.getCurrentSettings();
    this.hasChanges =
      currentSettings.targetLanguage !== this.originalSettings.targetLanguage ||
      currentSettings.secondLanguage !== this.originalSettings.secondLanguage ||
      currentSettings.uiLanguage !== this.originalSettings.uiLanguage ||
      currentSettings.theme !== this.originalSettings.theme;

    this.updateButtonStates();

    // Preview theme change immediately
    if (currentSettings.theme !== this.originalSettings.theme) {
      Theme.applyTheme(currentSettings.theme);
    }
  },

  getCurrentSettings() {
    return {
      targetLanguage: this.targetLangSelect?.value || 'ko',
      secondLanguage: this.secondLangSelect?.value || 'en',
      uiLanguage: this.uiLangSelect?.value || 'en',
      theme: this.themeSelect?.value || 'auto'
    };
  },

  updateButtonStates() {
    if (this.saveBtn) {
      this.saveBtn.disabled = !this.hasChanges;
    }
    if (this.cancelBtn) {
      this.cancelBtn.disabled = !this.hasChanges;
    }
  },

  async saveSettings() {
    if (!this.hasChanges) return;

    const currentSettings = this.getCurrentSettings();
    const uiLanguageChanged = currentSettings.uiLanguage !== this.originalSettings.uiLanguage;

    try {
      // Save all settings
      await chrome.storage.sync.set({
        targetLanguage: currentSettings.targetLanguage,
        secondLanguage: currentSettings.secondLanguage,
        uiLanguage: currentSettings.uiLanguage,
        theme: currentSettings.theme
      });

      // Apply theme
      await Theme.setTheme(currentSettings.theme);

      // Update original settings
      this.originalSettings = { ...currentSettings };
      this.hasChanges = false;
      this.updateButtonStates();

      DashboardUtils.showToast(DashboardUtils.getMessage('settingsSaved') || 'Settings saved');

      // If UI language changed, prompt to reload
      if (uiLanguageChanged) {
        setTimeout(() => {
          if (confirm(DashboardUtils.getMessage('reloadToApply') || 'Reload page to apply language change?')) {
            window.location.reload();
          }
        }, 500);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      DashboardUtils.showToast('Failed to save settings');
    }
  },

  cancelChanges() {
    if (!this.hasChanges) return;

    // Restore original values
    if (this.targetLangSelect) {
      this.targetLangSelect.value = this.originalSettings.targetLanguage;
    }
    if (this.secondLangSelect) {
      this.secondLangSelect.value = this.originalSettings.secondLanguage;
    }
    if (this.uiLangSelect) {
      this.uiLangSelect.value = this.originalSettings.uiLanguage;
    }
    if (this.themeSelect) {
      this.themeSelect.value = this.originalSettings.theme;
    }

    // Restore theme
    Theme.applyTheme(this.originalSettings.theme);

    this.hasChanges = false;
    this.updateButtonStates();

    DashboardUtils.showToast(DashboardUtils.getMessage('changesDiscarded') || 'Changes discarded');
  }
};

// Make it globally available
window.Settings = Settings;
