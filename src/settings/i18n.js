const SettingsI18n = {
  apply(langCode) {
    SettingsState.currentUILanguage = langCode;
    const translations = getUILanguage(langCode);

    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const message = translations[key];
      if (message) {
        element.textContent = message;
      }
    });
  }
};
