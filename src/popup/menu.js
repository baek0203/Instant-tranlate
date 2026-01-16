const PopupMenu = {
  toggleSettingsMenu() {
    const menuDropdown = document.getElementById('settings-dropdown');
    menuDropdown.classList.toggle('hidden');
  },

  closeSettingsMenu() {
    const menuDropdown = document.getElementById('settings-dropdown');
    if (menuDropdown) {
      menuDropdown.classList.add('hidden');
    }
  },

  openContactForm() {
    chrome.tabs.create({
      url: 'https://forms.gle/EzyJPL7aD3wKY8X49'
    });
    this.closeSettingsMenu();
  },

  openInfoModal() {
    const modal = document.getElementById('info-modal');
    modal.classList.remove('hidden');
    this.closeSettingsMenu();
  },

  closeInfoModal() {
    const modal = document.getElementById('info-modal');
    modal.classList.add('hidden');
  }
};
