/**
 * TerraTrade Marketplace - Main Application Controller & Router
 */

const App = {
  async init() {
    console.log('Initializing TerraTrade Marketplace...');

    // Detect backend environment
    await API.checkBackend();

    // Initialize Auth state
    await Auth.init();

    // Update cart and favorites badges
    Cart.updateBadge();
    Favorites.updateBadge();
    Chat.updateBadge();

    // Listen to hash changes for SPA routing
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('terratrade:auth-change', () => {
      Cart.updateBadge();
      Favorites.updateBadge();
      Chat.updateBadge();
      this.handleRoute();
    });

    // Handle initial route
    this.handleRoute();

    // Setup global listeners
    this.setupEventListeners();
  },

  handleRoute() {
    const hash = window.location.hash || '#home';
    const [path, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');

    // Hide all view containers
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('d-none'));

    // Highlight navbar links
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
      const linkHref = link.getAttribute('href');
      link.classList.toggle('active', linkHref === path);
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    switch (path) {
      case '#home':
        this.showView('view-home');
        Properties.loadFeatured();
        break;

      case '#discover':
        this.showView('view-discover');
        // Apply query params to properties search state if present
        if (params.get('q')) Properties.state.q = params.get('q');
        if (params.get('type')) Properties.state.property_type = params.get('type');
        if (params.get('location')) Properties.state.location = params.get('location');

        // Sync inputs
        const kwInput = document.getElementById('search-keyword');
        if (kwInput) kwInput.value = Properties.state.q || '';
        const locInput = document.getElementById('search-location');
        if (locInput) locInput.value = Properties.state.location || '';
        const typeSelect = document.getElementById('filter-property-type');
        if (typeSelect) typeSelect.value = Properties.state.property_type || '';

        Properties.searchProperties(true);
        break;

      case '#property':
        const propId = params.get('id');
        if (propId) {
          this.showView('view-property-detail');
          PropertyDetail.load(propId);
        } else {
          window.location.hash = '#discover';
        }
        break;

      case '#cart':
        this.showView('view-cart');
        Cart.load();
        break;

      case '#favorites':
        this.showView('view-favorites');
        Favorites.load();
        break;

      case '#chat':
        this.showView('view-chat');
        const convId = params.get('id');
        Chat.load(convId);
        break;

      case '#seller':
        this.showView('view-seller');
        Seller.load();
        break;

      case '#admin':
        this.showView('view-admin');
        Admin.load();
        break;

      case '#profile':
        this.showView('view-profile');
        this.loadProfileView();
        break;

      default:
        this.showView('view-home');
        Properties.loadFeatured();
        break;
    }
  },

  showView(viewId) {
    const el = document.getElementById(viewId);
    if (el) {
      el.classList.remove('d-none');
    }
  },

  showAuthModal(mode = 'login') {
    const loginTabBtn = document.getElementById('tab-login-btn');
    const registerTabBtn = document.getElementById('tab-register-btn');
    const modalEl = document.getElementById('modal-auth');

    if (modalEl) {
      if (mode === 'login' && loginTabBtn) {
        new bootstrap.Tab(loginTabBtn).show();
      } else if (mode === 'register' && registerTabBtn) {
        new bootstrap.Tab(registerTabBtn).show();
      }
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  },

  setupEventListeners() {
    // Search form on home page
    const homeSearchForm = document.getElementById('home-search-form');
    if (homeSearchForm) {
      homeSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = document.getElementById('home-search-input')?.value || '';
        const type = document.getElementById('home-search-type')?.value || '';
        const location = document.getElementById('home-search-location')?.value || '';

        window.location.hash = `#discover?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}&location=${encodeURIComponent(location)}`;
      });
    }

    // Discover search form
    const discoverSearchForm = document.getElementById('discover-search-form');
    if (discoverSearchForm) {
      discoverSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        Properties.state.q = document.getElementById('search-keyword')?.value || '';
        Properties.state.location = document.getElementById('search-location')?.value || '';
        Properties.state.property_type = document.getElementById('filter-property-type')?.value || '';
        Properties.state.min_price = document.getElementById('filter-min-price')?.value || '';
        Properties.state.max_price = document.getElementById('filter-max-price')?.value || '';
        Properties.state.min_area = document.getElementById('filter-min-area')?.value || '';
        Properties.state.max_area = document.getElementById('filter-max-area')?.value || '';
        Properties.state.bedrooms = document.getElementById('filter-bedrooms')?.value || '';
        Properties.state.sort_by = document.getElementById('filter-sort-by')?.value || 'newest';

        Properties.searchProperties(true);
      });
    }

    // Auth forms
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('login-username').value;
        const p = document.getElementById('login-password').value;
        try {
          await Auth.login(u, p);
          const modalEl = document.getElementById('modal-auth');
          if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
        } catch (err) {}
      });
    }

    const registerForm = document.getElementById('form-register');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const password_confirm = document.getElementById('reg-password-confirm').value;
        const first_name = document.getElementById('reg-first-name').value;
        const last_name = document.getElementById('reg-last-name').value;
        const is_seller = document.getElementById('reg-is-seller').checked;
        const company_name = document.getElementById('reg-company').value;

        try {
          await Auth.register({
            username, email, password, password_confirm,
            first_name, last_name, is_seller, company_name
          });
          const modalEl = document.getElementById('modal-auth');
          if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
        } catch (err) {}
      });
    }

    // Report submission form
    const reportForm = document.getElementById('form-report');
    if (reportForm) {
      reportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const propId = document.getElementById('report-property-id').value;
        const reason = document.getElementById('report-reason').value;
        const description = document.getElementById('report-description').value;

        try {
          const res = await API.post('/reports/', { property_id: propId, reason, description });
          API.showToast(res.message, 'success');
          const modalEl = document.getElementById('modal-report-listing');
          if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
          reportForm.reset();
        } catch (err) {
          API.showToast(err.message, 'error');
        }
      });
    }

    // Seller create listing form
    const sellerListingForm = document.getElementById('form-property-listing');
    if (sellerListingForm) {
      sellerListingForm.addEventListener('submit', (e) => Seller.handleFormSubmit(e));
    }
  },

  loadProfileView() {
    const container = document.getElementById('profile-content-container');
    if (!container) return;

    if (!Auth.isAuthenticated()) {
      container.innerHTML = `
        <div class="empty-state bg-white border rounded-3 p-5 my-4">
          <i class="bi bi-person-x empty-state-icon"></i>
          <h4>Log in to view your Profile</h4>
          <button class="btn btn-primary" onclick="App.showAuthModal('login')">Log In</button>
        </div>
      `;
      return;
    }

    const u = Auth.currentUser;

    container.innerHTML = `
      <div class="card border rounded-3 shadow-sm bg-white p-4">
        <h4 class="fw-bold mb-4">Account & Profile Settings</h4>

        <form onsubmit="App.handleProfileSave(event)">
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <label class="form-label fw-medium">First Name</label>
              <input type="text" id="prof-first-name" class="form-control" value="${u.first_name || ''}">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-medium">Last Name</label>
              <input type="text" id="prof-last-name" class="form-control" value="${u.last_name || ''}">
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label fw-medium">Email Address</label>
              <input type="email" id="prof-email" class="form-control" value="${u.email || ''}" required>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-medium">Phone Number</label>
              <input type="text" id="prof-phone" class="form-control" value="${u.phone_number || ''}">
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label fw-medium">Real Estate Agency / Company</label>
              <input type="text" id="prof-company" class="form-control" value="${u.company_name || ''}">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-medium">Broker License #</label>
              <input type="text" id="prof-license" class="form-control" value="${u.license_number || ''}">
            </div>

            <div class="col-12">
              <label class="form-label fw-medium">Avatar Image URL</label>
              <input type="url" id="prof-avatar" class="form-control" value="${u.avatar_url || ''}" placeholder="https://...">
            </div>

            <div class="col-12">
              <label class="form-label fw-medium">Professional Bio / About</label>
              <textarea id="prof-bio" class="form-control" rows="3">${u.bio || ''}</textarea>
            </div>

            <div class="col-12">
              <div class="form-check form-switch p-3 bg-light rounded">
                <input class="form-check-input ms-0 me-2" type="checkbox" id="prof-is-seller" ${u.is_seller ? 'checked' : ''}>
                <label class="form-check-label fw-bold" for="prof-is-seller">
                  Enable Seller Mode (Publish and manage land and property listings)
                </label>
              </div>
            </div>

            <div class="col-12 mt-4">
              <button type="submit" class="btn btn-primary px-4">
                <i class="bi bi-save me-1"></i> Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    `;
  },

  async handleProfileSave(event) {
    event.preventDefault();
    const first_name = document.getElementById('prof-first-name').value.trim();
    const last_name = document.getElementById('prof-last-name').value.trim();
    const email = document.getElementById('prof-email').value.trim();
    const phone_number = document.getElementById('prof-phone').value.trim();
    const company_name = document.getElementById('prof-company').value.trim();
    const license_number = document.getElementById('prof-license').value.trim();
    const avatar_url = document.getElementById('prof-avatar').value.trim();
    const bio = document.getElementById('prof-bio').value.trim();
    const is_seller = document.getElementById('prof-is-seller').checked;

    await Auth.updateProfile({
      first_name, last_name, email, phone_number,
      company_name, license_number, avatar_url, bio, is_seller
    });
  }
};

window.App = App;

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
