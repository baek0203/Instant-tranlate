const SettingsStore = {
  async get() {
    try {
      const result = await chrome.storage.sync.get(['targetLanguage', 'uiLanguage']);
      const targetLanguage = result.targetLanguage || 'ko';
      const uiLanguage = result.uiLanguage || result.targetLanguage || 'en';
      return { targetLanguage, uiLanguage };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return { targetLanguage: 'ko', uiLanguage: 'en' };
    }
  },

  async save(settings) {
    try {
      await chrome.storage.sync.set(settings);
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }
};
