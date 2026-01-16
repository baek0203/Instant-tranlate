const SettingsView = {
  grid: null,

  init() {
    this.grid = document.getElementById('language-grid');
    LanguageGrid.render(this.grid, langCode => this.selectLanguage(langCode));
  },

  selectLanguage(langCode) {
    SettingsState.selectedLanguage = langCode;
    SettingsI18n.apply(langCode);
    LanguageGrid.select(this.grid, langCode);
  },

  async load() {
    const settings = await SettingsStore.get();
    SettingsI18n.apply(settings.uiLanguage);
    this.selectLanguage(settings.targetLanguage);
  },

  async save() {
    const saved = await SettingsStore.save({
      targetLanguage: SettingsState.selectedLanguage,
      uiLanguage: SettingsState.selectedLanguage
    });

    if (!saved) {
      const translations = getUILanguage(SettingsState.currentUILanguage);
      alert(translations.saveFailed || 'Failed to save settings');
      return;
    }

    this.showStatusMessage();
  },

  async resetToDefault() {
    this.selectLanguage('ko');
    await this.save();
  },

  showStatusMessage() {
    const message = document.getElementById('status-message');
    message.classList.add('show');

    setTimeout(() => {
      message.classList.remove('show');
    }, 2000);
  },

  openHistory() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('history.html')
    });
  }
};
