// Dashboard Main Entry Point

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize theme first (prevents flash)
  await Theme.init();

  // Initialize i18n
  if (typeof applyI18n === 'function') {
    applyI18n();
  }

  // Initialize navigation
  Navigation.init();

  // Initialize modules
  Settings.init();
  Vocabulary.init();
  Info.init();

  console.log('Dashboard initialized');
});
