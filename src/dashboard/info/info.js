// Dashboard Information Module

const Info = {
  CONTACT_URL: 'https://forms.gle/r37L1EHmyJEqQNg96',

  init() {
    this.loadVersion();
  },

  async loadVersion() {
    try {
      const manifest = chrome.runtime.getManifest();
      const versionEl = document.getElementById('version-value');
      if (versionEl && manifest.version) {
        versionEl.textContent = manifest.version;
      }
    } catch (error) {
      console.error('Failed to load version:', error);
    }
  }
};

// Make it globally available
window.Info = Info;
