/**
 * TerraTrade Marketplace - Favorites / Saved Properties Module
 */

const Favorites = {
  items: [],

  async updateBadge() {
    const badge = document.getElementById('navbar-saved-count');
    if (!badge) return;

    if (!Auth.isAuthenticated()) {
      badge.textContent = '0';
      badge.classList.add('d-none');
      return;
    }

    try {
      const data = await API.get('/favorites/');
      const list = data.results || (Array.isArray(data) ? data : []);
      this.items = list;
      badge.textContent = list.length;
      badge.classList.toggle('d-none', list.length === 0);
    } catch (e) {
      badge.classList.add('d-none');
    }
  },

  async toggle(propertyId, btnEl = null) {
    if (!Auth.isAuthenticated()) {
      API.showToast('Please log in to save properties.', 'error');
      App.showAuthModal('login');
      return;
    }

    try {
      const res = await API.post('/favorites/toggle/', { property_id: propertyId });
      API.showToast(res.message);

      if (btnEl) {
        if (res.is_favorite) {
          btnEl.classList.add('active');
          btnEl.innerHTML = '<i class="bi bi-heart-fill text-danger"></i>';
        } else {
          btnEl.classList.remove('active');
          btnEl.innerHTML = '<i class="bi bi-heart"></i>';
        }
      }

      this.updateBadge();

      // If currently on favorites view, reload list
      if (window.location.hash.startsWith('#favorites')) {
        this.load();
      }
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async load() {
    const container = document.getElementById('favorites-container');
    if (!container) return;

    if (!Auth.isAuthenticated()) {
      container.innerHTML = `
        <div class="empty-state bg-white border rounded-3 p-5 my-4">
          <i class="bi bi-heart-break empty-state-icon"></i>
          <h4>Log in to view your Saved Properties</h4>
          <p class="text-muted">Save interesting acreage, land parcels, and residential properties to keep track of pricing and status changes.</p>
          <button class="btn btn-primary" onclick="App.showAuthModal('login')">Log In Now</button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
    `;

    try {
      const data = await API.get('/favorites/');
      const list = data.results || (Array.isArray(data) ? data : []);
      this.items = list;

      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state bg-white border rounded-3 p-5 my-4">
            <i class="bi bi-heart empty-state-icon text-muted"></i>
            <h4 class="fw-bold">No Saved Properties Yet</h4>
            <p class="text-muted mb-4">Click the heart icon on any property listing to save it to this collection for quick access.</p>
            <a href="#discover" class="btn btn-primary px-4 py-2">
              <i class="bi bi-compass me-1"></i> Discover Listings
            </a>
          </div>
        `;
        return;
      }

      const cardsHtml = list.map(item => Properties.renderPropertyCard(item.property)).join('');
      container.innerHTML = `
        <div class="row">
          <div class="col-12 mb-3">
            <h4 class="fw-bold">Saved Properties (${list.length})</h4>
          </div>
          ${cardsHtml}
        </div>
      `;

      this.updateBadge();
    } catch (err) {
      container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  }
};

window.Favorites = Favorites;
