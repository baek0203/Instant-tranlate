document.addEventListener('DOMContentLoaded', async () => {
  await PopupI18n.load();
  await PopupHistory.load();

  document.getElementById('select-mode-btn').addEventListener('click', () => {
    PopupHistory.toggleSelectMode();
  });
  document.getElementById('select-all-btn').addEventListener('click', () => {
    PopupHistory.toggleSelectAll();
  });
  document.getElementById('clear-btn').addEventListener('click', () => {
    PopupHistory.deleteSelected();
  });
  document.getElementById('export-btn').addEventListener('click', () => {
    PopupHistory.exportTranslations();
  });
  document.getElementById('delete-selected-btn').addEventListener('click', () => {
    PopupHistory.deleteSelected();
  });
  document.getElementById('cancel-select-btn').addEventListener('click', () => {
    PopupHistory.toggleSelectMode();
  });

  document.getElementById('settings-menu-btn').addEventListener('click', e => {
    e.stopPropagation();
    PopupMenu.toggleSettingsMenu();
  });

  document.getElementById('language-settings-btn').addEventListener('click', () => {
    PopupMenu.closeSettingsMenu();
    PopupSettingsView.toggle();
  });

  document.getElementById('contact-btn').addEventListener('click', () => {
    PopupMenu.openContactForm();
  });
  document.getElementById('info-btn').addEventListener('click', () => {
    PopupMenu.openInfoModal();
  });
  document.getElementById('close-info-btn').addEventListener('click', () => {
    PopupMenu.closeInfoModal();
  });

  document.getElementById('save-btn').addEventListener('click', () => {
    PopupSettingsView.saveSettings();
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    PopupSettingsView.resetToDefault();
  });

  const infoBackdrop = document.querySelector('#info-modal .modal-backdrop');
  if (infoBackdrop) {
    infoBackdrop.addEventListener('click', () => {
      PopupMenu.closeInfoModal();
    });
  }

  document.addEventListener('click', () => {
    PopupMenu.closeSettingsMenu();
  });
});
