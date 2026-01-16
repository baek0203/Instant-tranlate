document.addEventListener('DOMContentLoaded', async () => {
  SettingsView.init();
  await SettingsView.load();

  document.getElementById('save-btn').addEventListener('click', () => {
    SettingsView.save();
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    SettingsView.resetToDefault();
  });
  document.getElementById('view-history').addEventListener('click', () => {
    SettingsView.openHistory();
  });
});
