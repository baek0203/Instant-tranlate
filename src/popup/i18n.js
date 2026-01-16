const PopupI18n = {
  async load() {
    const settings = await SettingsStore.get();
    PopupState.currentUILanguage = settings.uiLanguage;
    this.apply();
  },

  apply() {
    const translations = this.getTexts();
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const message = translations[key];
      if (message) {
        element.textContent = message;
      }
    });
  },

  getTexts() {
    return getUILanguage(PopupState.currentUILanguage);
  }
};
