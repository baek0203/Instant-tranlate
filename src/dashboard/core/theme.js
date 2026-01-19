// Dashboard Theme Module

const Theme = {
  STORAGE_KEY: 'theme',

  init() {
    this.applyTheme();
    this.watchSystemTheme();
  },

  async getTheme() {
    try {
      const result = await chrome.storage.sync.get([this.STORAGE_KEY]);
      return result[this.STORAGE_KEY] || 'auto';
    } catch {
      return 'auto';
    }
  },

  async setTheme(theme) {
    try {
      await chrome.storage.sync.set({ [this.STORAGE_KEY]: theme });
      this.applyTheme(theme);
      return true;
    } catch (error) {
      console.error('Failed to save theme:', error);
      return false;
    }
  },

  async applyTheme(theme) {
    if (!theme) {
      theme = await this.getTheme();
    }

    const root = document.documentElement;

    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  },

  watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', async () => {
      const theme = await this.getTheme();
      if (theme === 'auto') {
        this.applyTheme('auto');
      }
    });
  }
};

// Make it globally available
window.Theme = Theme;
