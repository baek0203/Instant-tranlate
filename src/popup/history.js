const PopupHistory = {
  async load() {
    const container = document.getElementById('container');
    const uiTexts = PopupI18n.getTexts();

    try {
      const translations = await TranslationStore.getAll();

      if (translations.length === 0) {
        container.innerHTML = this.renderEmptyState(uiTexts);
        return;
      }

      container.innerHTML = translations.map(item => this.renderItem(item, uiTexts)).join('');
      this.bindItemEvents(container);
    } catch (error) {
      console.error('Failed to load translations:', error);
      container.innerHTML = `<div class="empty-state"><p>${uiTexts.dataLoadError || 'Error loading data'}</p></div>`;
    }
  },

  renderEmptyState(uiTexts) {
    return `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
        </svg>
        <p>${uiTexts.noTranslationsStored}</p>
      </div>
    `;
  },

  renderItem(item, uiTexts) {
    const siteInfo = item.pageUrl
      ? `
        <div class="item-site">
          <button class="item-link" data-id="${item.id}" data-url="${this.escapeHtml(item.pageUrl)}">
            ${this.escapeHtml(item.pageTitle || this.getHostname(item.pageUrl) || item.pageUrl)}
          </button>
          <div class="item-url">${this.escapeHtml(item.pageUrl)}</div>
        </div>
      `
      : '';

    return `
      <div class="translation-item" data-id="${item.id}">
        <input type="checkbox" class="select-checkbox" data-id="${item.id}" />
        <div class="item-wrapper">
          <div class="item-header">
            <span class="item-date">${item.date}</span>
            <div class="item-actions">
              <button class="item-btn copy-btn" data-text="${this.escapeHtml(item.translated)}">${uiTexts.copy}</button>
              <button class="item-btn delete delete-btn" data-id="${item.id}">${uiTexts.delete}</button>
            </div>
          </div>
          ${siteInfo}
          <div class="item-content">
            <div class="toggle-header">
              <button class="toggle-btn">
                <svg class="toggle-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 17l5-5-5-5v10z"/>
                </svg>
              </button>
              <div class="text-content original collapsed">${this.escapeHtml(item.original)}</div>
            </div>
            <div class="text-section translated-section" style="display: none;">
              <div class="text-label">${uiTexts.translation}</div>
              <div class="text-content translated">${this.escapeHtml(item.translated)}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindItemEvents(container) {
    container.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const item = btn.closest('.translation-item');
        const translatedSection = item.querySelector('.translated-section');
        const icon = btn.querySelector('.toggle-icon');
        const isExpanded = translatedSection.style.display !== 'none';

        if (isExpanded) {
          translatedSection.style.display = 'none';
          icon.style.transform = 'rotate(0deg)';
        } else {
          translatedSection.style.display = 'block';
          icon.style.transform = 'rotate(90deg)';
        }
      });
    });

    container.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const text = e.target.getAttribute('data-text');
        this.copyToClipboard(text, btn);
      });
    });

    container.querySelectorAll('.item-link').forEach(btn => {
      btn.addEventListener('click', e => {
        const url = e.currentTarget.getAttribute('data-url');
        const id = e.currentTarget.getAttribute('data-id');
        const deepLink = this.buildDeepLink(url, id);
        chrome.tabs.create({ url: deepLink });
      });
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = parseInt(e.target.getAttribute('data-id'), 10);
        this.deleteTranslation(id);
      });
    });

    container.querySelectorAll('.select-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', e => {
        const id = parseInt(e.target.getAttribute('data-id'), 10);

        if (e.target.checked) {
          PopupState.selectedIds.add(id);
        } else {
          PopupState.selectedIds.delete(id);
        }

        this.updateActionBar();
      });
    });
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  getHostname(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  },

  buildDeepLink(url, id) {
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
  },

  async copyToClipboard(text, button) {
    const uiTexts = PopupI18n.getTexts();
    try {
      await navigator.clipboard.writeText(text);
      const originalText = button.textContent;
      button.textContent = uiTexts.copied;
      setTimeout(() => {
        button.textContent = originalText;
      }, 1500);
    } catch (error) {
      console.error('Copy failed:', error);
      alert(uiTexts.copyFailed || 'Failed to copy');
    }
  },

  async deleteTranslation(id) {
    const uiTexts = PopupI18n.getTexts();
    if (!confirm(uiTexts.confirmDelete || 'Delete this translation?')) {
      return;
    }

    const success = await TranslationStore.deleteById(id);
    if (success) {
      this.load();
    } else {
      alert(uiTexts.deleteFailed || 'Failed to delete');
    }
  },

  async clearAllTranslations() {
    const uiTexts = PopupI18n.getTexts();
    if (!confirm(uiTexts.confirmDeleteAll || 'Delete all translations?')) {
      return;
    }

    const success = await TranslationStore.clear();
    if (success) {
      this.load();
    } else {
      alert(uiTexts.deleteFailed || 'Failed to delete');
    }
  },

  async exportTranslations() {
    const uiTexts = PopupI18n.getTexts();
    const translations = await TranslationStore.getAll();

    if (translations.length === 0) {
      alert(uiTexts.noExportData || 'No data to export');
      return;
    }

    try {
      const dataStr = JSON.stringify(translations, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `translations_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert(uiTexts.exportFailed || 'Failed to export');
    }
  },

  toggleSelectMode() {
    const uiTexts = PopupI18n.getTexts();
    const container = document.getElementById('container');
    const header = document.querySelector('.header');
    const selectModeBtn = document.getElementById('select-mode-btn');

    PopupState.isSelectMode = !PopupState.isSelectMode;
    PopupState.selectedIds.clear();

    if (PopupState.isSelectMode) {
      container.classList.add('select-mode');
      header.classList.add('select-mode-active');
      selectModeBtn.textContent = uiTexts.cancel;
    } else {
      container.classList.remove('select-mode');
      header.classList.remove('select-mode-active');
      selectModeBtn.textContent = uiTexts.select;

      container.querySelectorAll('.select-checkbox').forEach(cb => {
        cb.checked = false;
      });
    }

    this.updateActionBar();
  },

  updateActionBar() {
    const uiTexts = PopupI18n.getTexts();
    const actionBar = document.getElementById('action-bar');
    const selectedCount = document.getElementById('selected-count');

    if (PopupState.isSelectMode && PopupState.selectedIds.size > 0) {
      actionBar.classList.remove('hidden');
      selectedCount.textContent = uiTexts.selectedCount
        ? uiTexts.selectedCount.replace('$COUNT$', PopupState.selectedIds.size.toString())
        : `${PopupState.selectedIds.size} selected`;
    } else {
      actionBar.classList.add('hidden');
    }
  },

  async toggleSelectAll() {
    try {
      const translations = await TranslationStore.getAll();
      const allIds = translations.map(item => item.id);
      const allSelected = allIds.every(id => PopupState.selectedIds.has(id));

      if (allSelected) {
        PopupState.selectedIds.clear();
        document.querySelectorAll('.select-checkbox').forEach(cb => {
          cb.checked = false;
        });
      } else {
        PopupState.selectedIds = new Set(allIds);
        document.querySelectorAll('.select-checkbox').forEach(cb => {
          cb.checked = true;
        });
      }

      this.updateActionBar();
    } catch (error) {
      console.error('전체선택 실패:', error);
    }
  },

  async deleteSelected() {
    if (PopupState.selectedIds.size === 0) return;

    if (!confirm(chrome.i18n.getMessage('confirmDeleteSelected', [PopupState.selectedIds.size.toString()]))) {
      return;
    }

    const success = await TranslationStore.deleteByIds(PopupState.selectedIds);
    if (!success) {
      alert(chrome.i18n.getMessage('deleteFailed'));
      return;
    }

    PopupState.selectedIds.clear();
    await this.load();
    this.updateActionBar();
  }
};
