// Dashboard Utility Functions

const DashboardUtils = {
  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  },

  // Escape CSV special characters
  escapeCsv(text) {
    return (text || '').replace(/"/g, '""');
  },

  // Format timestamp to localized date
  formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  },

  // Extract domain from URL
  getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url || '';
    }
  },

  // Get i18n message with placeholder support
  getMessage(key, ...args) {
    try {
      let msg = chrome.i18n.getMessage(key);
      if (msg && args.length > 0) {
        args.forEach((arg, i) => {
          msg = msg.replace(`$${i + 1}`, arg).replace('$COUNT$', arg);
        });
      }
      return msg || key;
    } catch {
      return key;
    }
  },

  // Show toast notification
  showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2000);
  },

  // Copy text to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast(this.getMessage('copied') || 'Copied!');
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      return false;
    }
  },

  // Check if text is a sentence (more than 5 words)
  isSentence(text) {
    if (!text) return false;
    const words = text.trim().split(/\s+/);
    return words.length > 5;
  },

  // Build deep link URL with dt-id parameter
  // Same logic as PopupHistory.buildDeepLink
  buildDeepLink(url, id) {
    if (!url || !id) return null;
    try {
      const urlObj = new URL(url);
      const hash = urlObj.hash.replace(/^#/, '');
      if (!hash) {
        urlObj.hash = `dt-id=${id}`;
      } else if (hash.includes('dt-id=')) {
        const params = new URLSearchParams(hash);
        params.set('dt-id', id);
        urlObj.hash = params.toString();
      } else {
        urlObj.hash = `${hash}&dt-id=${id}`;
      }
      return urlObj.toString();
    } catch (error) {
      console.error('Failed to build deep link:', error);
      return url;
    }
  }
};

// Make it globally available
window.DashboardUtils = DashboardUtils;
