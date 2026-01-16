const LanguageGrid = {
  render(grid, onSelect) {
    grid.innerHTML = '';

    const languages = (typeof LANGUAGES !== 'undefined' && LANGUAGES)
      ? LANGUAGES
      : globalThis.LANGUAGES;

    if (!Array.isArray(languages) || languages.length === 0) {
      console.error('[DragTranslator] Language list is not available.');
      return;
    }

    languages.forEach(lang => {
      const option = document.createElement('div');
      option.className = 'language-option';
      option.dataset.lang = lang.code;

      option.innerHTML = `
        <input type="radio" name="language" value="${lang.code}" id="lang-${lang.code}">
        <label class="language-label" for="lang-${lang.code}">
          ${lang.nativeName}
          <div class="language-code">${lang.code}</div>
        </label>
      `;

      option.addEventListener('click', () => {
        onSelect(lang.code);
      });

      grid.appendChild(option);
    });
  },

  select(grid, langCode) {
    grid.querySelectorAll('.language-option').forEach(opt => {
      opt.classList.remove('selected');
    });

    const selectedOption = grid.querySelector(`[data-lang="${langCode}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
      const input = selectedOption.querySelector('input');
      if (input) input.checked = true;
    }
  }
};
