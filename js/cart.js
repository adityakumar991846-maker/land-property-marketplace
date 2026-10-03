/**
 * TerraTrade Marketplace - Cart & Shortlist Module
 */

const Cart = {
  data: {
    items: [],
    total_value: 0,
    item_count: 0
  },

  async updateBadge() {
    const badge = document.getElementById('navbar-cart-count');
    if (!badge) return;

    if (!Auth.isAuthenticated()) {
      badge.textContent = '0';
      badge.classList.add('d-none');
      return;
    }

    try {
      const res = await API.get('/cart/');
      this.data = res;
      badge.textContent = res.item_count;
      badge.classList.toggle('d-none', res.item_count === 0);
    } catch (e) {
      badge.classList.add('d-none');
    }
  },

  async addItem(propertyId, notes = '', offerAmount = null) {
    if (!Auth.isAuthenticated()) {
      API.showToast('Please log in to add properties to your shortlist.', 'error');
      App.showAuthModal('login');
      return;
    }

    try {
      const payload = { property_id: propertyId };
      if (notes) payload.notes = notes;
      if (offerAmount) payload.offer_amount = offerAmount;

      const res = await API.post('/cart/items/', payload);
      API.showToast(res.message);
      this.updateBadge();
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async load() {
    const container = document.getElementById('cart-items-container');
    const summaryContainer = document.getElementById('cart-summary-container');
    if (!container) return;

    if (!Auth.isAuthenticated()) {
      container.innerHTML = `
        <div class="empty-state bg-white border rounded-3 p-5 my-4">
          <i class="bi bi-cart-x empty-state-icon"></i>
          <h4>Log in to access your Consideration Cart</h4>
          <p class="text-muted">Keep track of properties you are seriously considering, make initial offer notes, and send inquiries.</p>
          <button class="btn btn-primary" onclick="App.showAuthModal('login')">Log In Now</button>
        </div>
      `;
      if (summaryContainer) summaryContainer.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
    `;

    try {
      const res = await API.get('/cart/');
      this.data = res;
      this.render();
      this.updateBadge();
    } catch (err) {
      container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  },

  render() {
    const container = document.getElementById('cart-items-container');
    const summaryContainer = document.getElementById('cart-summary-container');
    if (!container) return;

    if (!this.data.items || this.data.items.length === 0) {
      container.innerHTML = `
        <div class="empty-state bg-white border rounded-3 p-5 my-4">
          <i class="bi bi-cart3 empty-state-icon text-muted"></i>
          <h4 class="fw-bold">Your Consideration Shortlist is Empty</h4>
          <p class="text-muted mb-4">Browse available land parcels, residential homes, and commercial acreage to add them to your review shortlist.</p>
          <a href="#discover" class="btn btn-primary px-4 py-2">
            <i class="bi bi-compass me-1"></i> Discover Listings
          </a>
        </div>
      `;
      if (summaryContainer) summaryContainer.innerHTML = '';
      return;
    }

    const itemsHtml = this.data.items.map(item => {
      const prop = item.property;
      const formattedPrice = Number(prop.price).toLocaleString();
      const areaText = prop.area_acres ? `${prop.area_acres} Acres` : '';

      return `
        <div class="card border rounded-3 p-3 mb-3 shadow-sm bg-white" id="cart-item-${item.id}">
          <div class="row g-3 align-items-center">
            <div class="col-12 col-md-3">
              <img src="${prop.cover_image}" alt="${prop.title}" class="rounded w-100 object-fit-cover" style="height: 120px;">
            </div>

            <div class="col-12 col-md-6">
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="badge bg-secondary-subtle text-secondary">${prop.property_type_display || prop.property_type}</span>
                ${areaText ? `<span class="badge bg-light text-dark border">${areaText}</span>` : ''}
              </div>
              
              <h5 class="fw-bold mb-1">
                <a href="#property?id=${prop.id}" class="text-dark text-decoration-none">${prop.title}</a>
              </h5>
              
              <p class="text-muted small mb-2">
                <i class="bi bi-geo-alt-fill text-danger me-1"></i>${prop.city}, ${prop.state}
              </p>

              <!-- Buyer Notes and Offer amount -->
              <div class="row g-2 mt-2">
                <div class="col-12 col-sm-6">
                  <label class="form-label small text-muted mb-0">Buyer Consideration Notes</label>
                  <input type="text" class="form-control form-control-sm" value="${item.notes || ''}" 
                         placeholder="e.g. Inquire on water permit" 
                         onchange="Cart.updateItem(${item.id}, this.value, null)">
                </div>
                <div class="col-12 col-sm-6">
                  <label class="form-label small text-muted mb-0">Proposed Target Offer ($)</label>
                  <input type="number" class="form-control form-control-sm" value="${item.offer_amount || ''}" 
                         placeholder="${prop.price}" 
                         onchange="Cart.updateItem(${item.id}, null, this.value)">
                </div>
              </div>
            </div>

            <div class="col-12 col-md-3 text-md-end border-start-md pt-3 pt-md-0">
              <div class="fs-4 fw-bold text-success mb-2">$${formattedPrice}</div>
              <div class="d-flex flex-md-column gap-2 justify-content-end">
                <a href="#property?id=${prop.id}" class="btn btn-sm btn-outline-primary">
                  View Specs
                </a>
                <button class="btn btn-sm btn-outline-danger" onclick="Cart.removeItem(${item.id})">
                  <i class="bi bi-trash me-1"></i> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="fw-bold mb-0">Properties Under Consideration (${this.data.item_count})</h4>
        <button class="btn btn-sm btn-outline-secondary" onclick="Cart.clear()">
          <i class="bi bi-trash3 me-1"></i> Clear All
        </button>
      </div>
      ${itemsHtml}
    `;

    // Render portfolio summary card
    if (summaryContainer) {
      const formattedTotal = Number(this.data.total_value).toLocaleString();
      summaryContainer.innerHTML = `
        <div class="card border rounded-3 p-4 shadow-sm bg-white position-sticky" style="top: 85px;">
          <h5 class="fw-bold mb-3 border-bottom pb-2">Portfolio Summary</h5>
          
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted">Shortlisted Parcels:</span>
            <span class="fw-bold">${this.data.item_count}</span>
          </div>

          <div class="d-flex justify-content-between mb-3">
            <span class="text-muted">Total Asking Value:</span>
            <span class="fw-bold fs-4 text-primary">$${formattedTotal}</span>
          </div>

          <div class="alert alert-info py-2 small mb-3">
            <i class="bi bi-shield-check me-1"></i> <strong>Non-binding Shortlist:</strong> Review properties and initiate formal inquiry discussions with sellers simultaneously.
          </div>

          <button class="btn btn-primary btn-lg w-100 mb-2 d-flex align-items-center justify-content-center gap-2" onclick="Cart.submitInquiries()">
            <i class="bi bi-send-check-fill"></i> Submit Inquiries to Sellers
          </button>
          
          <a href="#discover" class="btn btn-outline-secondary w-100">
            Continue Discovering
          </a>
        </div>
      `;
    }
  },

  async updateItem(itemId, notes, offerAmount) {
    try {
      const payload = {};
      if (notes !== null) payload.notes = notes;
      if (offerAmount !== null) payload.offer_amount = offerAmount;

      await API.patch(`/cart/items/${itemId}/`, payload);
      API.showToast('Item preferences saved');
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async removeItem(itemId) {
    try {
      const res = await API.delete(`/cart/items/${itemId}/`);
      API.showToast(res.message);
      this.load();
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async clear() {
    if (!confirm('Are you sure you want to clear your consideration shortlist?')) return;
    try {
      await API.post('/cart/clear/');
      API.showToast('Cart cleared');
      this.load();
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async submitInquiries() {
    try {
      const res = await API.post('/cart/inquire/', {
        message: 'Hello! I have reviewed your property listing in my shortlist and would like to arrange an official inspection and verify zoning/title documents.'
      });

      API.showToast(res.message, 'success');
      // Redirect to chat
      window.location.hash = '#chat';
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  }
};

window.Cart = Cart;
