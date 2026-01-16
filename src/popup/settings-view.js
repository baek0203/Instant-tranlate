const PopupSettingsView = {
  grid: null,

  async toggle() {
    const container = document.getElementById('container');
    const settingsView = document.getElementById('settings-view');
    const actionBar = document.getElementById('action-bar');
    const header = document.querySelector('.header h1');

    PopupState.isSettingsView = !PopupState.isSettingsView;

    if (PopupState.isSettingsView) {
      container.classList.add('hidden');
      actionBar.classList.add('hidden');
      settingsView.classList.remove('hidden');
      header.textContent = PopupI18n.getTexts().settings || 'Settings';

      this.ensureGrid();
      await this.loadSettings();
    } else {
      settingsView.classList.add('hidden');
      container.classList.remove('hidden');
      header.textContent = PopupI18n.getTexts().translationHistory || 'Translation History';
      await PopupHistory.load();
    }
  },

  ensureGrid() {
    if (!this.grid) {
      this.grid = document.getElementById('language-grid');
      LanguageGrid.render(this.grid, langCode => this.selectLanguage(langCode));
    }
  },

  selectLanguage(langCode) {
    PopupState.selectedLanguage = langCode;
    PopupState.currentUILanguage = langCode;
    PopupI18n.apply();
    LanguageGrid.select(this.grid, langCode);
  },

  async loadSettings() {
    const settings = await SettingsStore.get();
    PopupState.selectedLanguage = settings.targetLanguage;
    this.selectLanguage(settings.targetLanguage);
  },

  async saveSettings() {
    const saved = await SettingsStore.save({
      targetLanguage: PopupState.selectedLanguage,
      uiLanguage: PopupState.selectedLanguage
    });

    if (!saved) {
      const uiTexts = PopupI18n.getTexts();
      alert(uiTexts.saveFailed || 'Failed to save settings');
      return;
    }

    this.showStatusMessage();
    setTimeout(() => {
      this.toggle();
    }, 1500);
  },

  async resetToDefault() {
    this.selectLanguage('ko');
    await this.saveSettings();
  },

  showStatusMessage() {
    const message = document.getElementById('status-message');
    message.classList.add('show');

    setTimeout(() => {
      message.classList.remove('show');
    }, 2000);
  }
};
