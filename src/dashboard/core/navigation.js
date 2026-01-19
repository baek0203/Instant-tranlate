// Dashboard Navigation Module

const Navigation = {
  init() {
    this.navItems = document.querySelectorAll('.nav-item');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.pageTitle = document.querySelector('.page-title');

    this.bindEvents();
    this.handleInitialHash();
  },

  bindEvents() {
    // Nav item clicks
    this.navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = item.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Handle browser back/forward
    window.addEventListener('hashchange', () => {
      this.handleInitialHash();
    });
  },

  handleInitialHash() {
    const hash = window.location.hash.replace('#', '') || 'vocabulary';
    this.switchTab(hash, false);
  },

  switchTab(tabName, updateHash = true) {
    // Update active nav item
    this.navItems.forEach(nav => {
      nav.classList.toggle('active', nav.dataset.tab === tabName);
    });

    // Show corresponding tab content
    this.tabContents.forEach(tab => {
      tab.classList.toggle('active', tab.id === `${tabName}-tab`);
    });

    // Update page title
    const activeNav = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
    if (activeNav && this.pageTitle) {
      const titleSpan = activeNav.querySelector('span');
      if (titleSpan) {
        this.pageTitle.textContent = titleSpan.textContent;
      }
    }

    // Update URL hash
    if (updateHash) {
      window.location.hash = tabName;
    }

    // Trigger tab change event for modules to react
    window.dispatchEvent(new CustomEvent('tabchange', { detail: { tab: tabName } }));
  }
};

// Make it globally available
window.Navigation = Navigation;
