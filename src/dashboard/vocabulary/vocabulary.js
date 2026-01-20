// Dashboard Vocabulary Module

const Vocabulary = {
  selectMode: false,
  selectedIds: new Set(),

  // Font size levels: S, M, L, XL
  FONT_SIZES: [
    { label: 'S', value: 14 },
    { label: 'M', value: 18 },
    { label: 'L', value: 22 },
    { label: 'XL', value: 26 }
  ],
  currentFontSizeIndex: 1, // Default: M (18px)

  init() {
    this.wordsList = document.getElementById('words-list');
    this.sentencesList = document.getElementById('sentences-list');
    this.emptyWords = document.getElementById('empty-words');
    this.emptySentences = document.getElementById('empty-sentences');
    this.actionBar = document.getElementById('action-bar');
    this.selectedCountEl = document.getElementById('selected-count');
    this.fontSizeLabel = document.getElementById('font-size-label');

    this.loadFontSize();
    this.bindEvents();
    this.render();
  },

  async loadFontSize() {
    try {
      const result = await chrome.storage.sync.get(['fontSize']);
      if (result.fontSize) {
        const index = this.FONT_SIZES.findIndex(f => f.value === parseInt(result.fontSize));
        if (index !== -1) {
          this.currentFontSizeIndex = index;
        }
      }
      this.applyFontSize();
    } catch (error) {
      console.error('Failed to load font size:', error);
    }
  },

  applyFontSize() {
    const size = this.FONT_SIZES[this.currentFontSizeIndex];
    document.documentElement.style.setProperty('--vocab-font-size', `${size.value}px`);
    if (this.fontSizeLabel) {
      this.fontSizeLabel.textContent = size.label;
    }
  },

  async saveFontSize() {
    try {
      const size = this.FONT_SIZES[this.currentFontSizeIndex];
      await chrome.storage.sync.set({ fontSize: size.value.toString() });
    } catch (error) {
      console.error('Failed to save font size:', error);
    }
  },

  increaseFontSize() {
    if (this.currentFontSizeIndex < this.FONT_SIZES.length - 1) {
      this.currentFontSizeIndex++;
      this.applyFontSize();
      this.saveFontSize();
    }
  },

  decreaseFontSize() {
    if (this.currentFontSizeIndex > 0) {
      this.currentFontSizeIndex--;
      this.applyFontSize();
      this.saveFontSize();
    }
  },

  bindEvents() {
    // Select button
    document.getElementById('select-btn')?.addEventListener('click', () => this.toggleSelectMode());

    // Select all button
    document.getElementById('select-all-btn')?.addEventListener('click', () => this.toggleSelectAll());

    // Export button
    document.getElementById('export-btn')?.addEventListener('click', () => this.exportVocabulary());

    // Cancel select
    document.getElementById('cancel-select-btn')?.addEventListener('click', () => this.toggleSelectMode());

    // Delete selected
    document.getElementById('delete-selected-btn')?.addEventListener('click', () => this.deleteSelected());

    // Font size controls
    document.getElementById('font-increase')?.addEventListener('click', () => this.increaseFontSize());
    document.getElementById('font-decrease')?.addEventListener('click', () => this.decreaseFontSize());

    // Listen for storage changes to update in real-time
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.translations) {
        this.render();
      }
    });
  },

  async render() {
    const translations = await TranslationStore.getAll();

    // Separate words and sentences
    const words = translations.filter(item => !DashboardUtils.isSentence(item.original));
    const sentences = translations.filter(item => DashboardUtils.isSentence(item.original));

    this.renderList(this.wordsList, this.emptyWords, words);
    this.renderList(this.sentencesList, this.emptySentences, sentences);
  },

  renderList(listEl, emptyEl, items) {
    if (!listEl || !emptyEl) return;

    if (items.length === 0) {
      listEl.innerHTML = '';
      emptyEl.classList.remove('hidden');
      return;
    }

    emptyEl.classList.add('hidden');

    listEl.innerHTML = items.map(item => this.renderItem(item)).join('');

    // Add event listeners
    this.attachItemListeners(listEl);
  },

  // Build deep link URL (same as PopupHistory.buildDeepLink)
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
  },

  renderItem(item) {
    const { escapeHtml, formatDate, getDomain, getMessage } = DashboardUtils;
    const isSelected = this.selectedIds.has(item.id);

    // Use pageUrl (history.js data structure) - this is where the text was found
    const sourceUrl = item.pageUrl;
    const pageTitle = item.pageTitle || (sourceUrl ? getDomain(sourceUrl) : '');

    const itemContent = `
      <div class="vocabulary-item ${isSelected ? 'selected' : ''}" data-id="${item.id}">
        ${this.selectMode ? `
          <label class="vocab-checkbox-label">
            <input type="checkbox" class="vocab-checkbox" ${isSelected ? 'checked' : ''}>
            <span class="vocab-checkmark"></span>
          </label>
        ` : ''}
        <div class="vocab-content">
          <div class="vocab-original">${escapeHtml(item.original)}</div>
          <div class="vocab-translated">${escapeHtml(item.translated)}</div>
          <div class="vocab-meta">
            <span class="vocab-date">${formatDate(item.timestamp)}</span>
            ${sourceUrl ? `
              <button class="vocab-source-link" data-url="${escapeHtml(sourceUrl)}" data-id="${item.id}">
                ${escapeHtml(pageTitle)}
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                </svg>
              </button>
            ` : ''}
          </div>
        </div>
        ${!this.selectMode ? `
          <div class="vocab-actions">
            <button class="btn btn-small btn-secondary btn-copy" data-text="${escapeHtml(item.translated)}" title="${getMessage('copy')}">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
            <button class="btn btn-small btn-secondary btn-delete" data-id="${item.id}" title="${getMessage('delete')}">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    return itemContent;
  },

  attachItemListeners(listEl) {
    if (this.selectMode) {
      listEl.querySelectorAll('.vocab-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => this.handleCheckboxChange(e));
      });
    } else {
      listEl.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          DashboardUtils.copyToClipboard(btn.dataset.text);
        });
      });
      listEl.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteItem(btn.dataset.id);
        });
      });
      // Source link click - open deeplink in new tab
      listEl.querySelectorAll('.vocab-source-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const url = btn.dataset.url;
          const id = btn.dataset.id;
          const deepLink = this.buildDeepLink(url, id);
          if (deepLink) {
            chrome.tabs.create({ url: deepLink });
          }
        });
      });
    }
  },

  toggleSelectMode() {
    this.selectMode = !this.selectMode;
    this.selectedIds.clear();

    const selectBtn = document.getElementById('select-btn');
    const selectAllBtn = document.getElementById('select-all-btn');

    if (this.selectMode) {
      this.actionBar?.classList.remove('hidden');
      selectAllBtn?.classList.remove('hidden');
      if (selectBtn) selectBtn.textContent = DashboardUtils.getMessage('cancel') || 'Cancel';
    } else {
      this.actionBar?.classList.add('hidden');
      selectAllBtn?.classList.add('hidden');
      if (selectBtn) selectBtn.textContent = DashboardUtils.getMessage('select') || 'Select';
    }

    this.updateSelectedCount();
    this.render();
  },

  async toggleSelectAll() {
    const translations = await TranslationStore.getAll();
    const allIds = translations.map(item => item.id);
    const selectAllBtn = document.getElementById('select-all-btn');

    // If all are selected, deselect all; otherwise select all
    if (this.selectedIds.size === allIds.length && allIds.length > 0) {
      this.selectedIds.clear();
      if (selectAllBtn) selectAllBtn.textContent = DashboardUtils.getMessage('selectAll') || 'Select All';
    } else {
      allIds.forEach(id => this.selectedIds.add(id));
      if (selectAllBtn) selectAllBtn.textContent = DashboardUtils.getMessage('deselectAll') || 'Deselect All';
    }

    this.updateSelectedCount();
    this.render();
  },

  handleCheckboxChange(e) {
    const item = e.target.closest('.vocabulary-item');
    const id = item?.dataset.id;
    if (!id) return;

    if (e.target.checked) {
      this.selectedIds.add(id);
      item.classList.add('selected');
    } else {
      this.selectedIds.delete(id);
      item.classList.remove('selected');
    }

    this.updateSelectedCount();
  },

  updateSelectedCount() {
    const count = this.selectedIds.size;
    if (this.selectedCountEl) {
      this.selectedCountEl.textContent = DashboardUtils.getMessage('selectedCount', count) || `${count} selected`;
    }
  },

  async deleteSelected() {
    if (this.selectedIds.size === 0) return;

    const confirmMsg = DashboardUtils.getMessage('confirmDeleteSelected', this.selectedIds.size) ||
      `Are you sure you want to delete ${this.selectedIds.size} selected items?`;

    if (confirm(confirmMsg)) {
      await TranslationStore.deleteByIds([...this.selectedIds]);
      this.selectedIds.clear();
      this.toggleSelectMode();
      DashboardUtils.showToast(DashboardUtils.getMessage('deleted') || 'Deleted');
    }
  },

  async deleteItem(id) {
    const confirmMsg = DashboardUtils.getMessage('confirmDelete') || 'Are you sure you want to delete this item?';

    if (confirm(confirmMsg)) {
      await TranslationStore.deleteById(id);
      await this.render();
      DashboardUtils.showToast(DashboardUtils.getMessage('deleted') || 'Deleted');
    }
  },

  async exportVocabulary() {
    const translations = await TranslationStore.getAll();

    if (translations.length === 0) {
      DashboardUtils.showToast(DashboardUtils.getMessage('noExportData') || 'No data to export');
      return;
    }

    const { escapeCsv, formatDate } = DashboardUtils;

    const csvContent = 'Original,Translated,Type,Date,URL\n' +
      translations.map(item => {
        const type = DashboardUtils.isSentence(item.original) ? 'Sentence' : 'Word';
        return `"${escapeCsv(item.original)}","${escapeCsv(item.translated)}","${type}","${formatDate(item.timestamp)}","${item.url || ''}"`;
      }).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instant-translate-vocabulary_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    DashboardUtils.showToast(DashboardUtils.getMessage('exported') || 'Exported!');
  }
};

// Make it globally available
window.Vocabulary = Vocabulary;
