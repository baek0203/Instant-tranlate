const TranslationStore = {
  async getAll() {
    try {
      const result = await chrome.storage.local.get(['translations']);
      return result.translations || [];
    } catch (error) {
      console.error('Failed to load translations:', error);
      return [];
    }
  },

  async setAll(translations) {
    try {
      await chrome.storage.local.set({ translations });
      return true;
    } catch (error) {
      console.error('Failed to save translations:', error);
      return false;
    }
  },

  async deleteById(id) {
    const translations = await this.getAll();
    const filtered = translations.filter(item => item.id !== id);
    return this.setAll(filtered);
  },

  async deleteByIds(ids) {
    const translations = await this.getAll();
    const idSet = new Set(ids);
    const filtered = translations.filter(item => !idSet.has(item.id));
    return this.setAll(filtered);
  },

  async clear() {
    return this.setAll([]);
  }
};
