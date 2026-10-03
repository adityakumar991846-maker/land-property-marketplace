/**
 * TerraTrade Marketplace - Property Details Module
 */

const PropertyDetail = {
  currentProperty: null,
  mapInstance: null,

  async load(propertyId) {
    const container = document.getElementById('property-detail-container');
    if (!container) return;

    container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Loading property information...</p>
      </div>
    `;

    try {
      const prop = await API.get(`/properties/${propertyId}/`);
      this.currentProperty = prop;
      this.render(prop, container);
      this.initMiniMap(prop);
      this.checkFavoriteStatus(prop.id);
    } catch (err) {
      container.innerHTML = `
        <div class="alert alert-danger my-5 text-center p-5">
          <i class="bi bi-exclamation-triangle-fill fs-1 d-block mb-3"></i>
          <h4>Unable to load property details</h4>
          <p class="text-muted">${err.message}</p>
          <a href="#discover" class="btn btn-outline-primary mt-2">Browse Available Listings</a>
        </div>
      `;
    }
  },

  render(prop, container) {
    const formattedPrice = Number(prop.price).toLocaleString();
    const formattedAcres = prop.area_acres ? `${prop.area_acres} Acres` : '';
    const formattedSqft = prop.area_sqft ? `${Number(prop.area_sqft).toLocaleString()} sq ft` : '';
    const pricePerAcre = prop.area_acres && prop.area_acres > 0
      ? `$${Math.round(prop.price / prop.area_acres).toLocaleString()} / acre`
      : '';

    const images = prop.images && prop.images.length > 0
      ? prop.images
      : [{ display_url: prop.cover_image, caption: prop.title }];

    const thumbnailsHtml = images.map((img, idx) => `
      <img src="${img.display_url}" class="gallery-thumbnail ${idx === 0 ? 'active' : ''}" 
           alt="${img.caption || 'Property photo'}" 
           onclick="PropertyDetail.setMainImage('${img.display_url}', this)">
    `).join('');

    const residentialSpecs = (prop.property_type === 'house' || prop.property_type === 'apartment') ? `
      <div class="row g-3 p-3 bg-light rounded-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="text-muted small">Bedrooms</div>
          <div class="fw-bold fs-5">${prop.bedrooms || 'N/A'}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="text-muted small">Bathrooms</div>
          <div class="fw-bold fs-5">${prop.bathrooms || 'N/A'}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="text-muted small">Living Area</div>
          <div class="fw-bold fs-5">${formattedSqft || 'N/A'}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="text-muted small">Lot Size</div>
          <div class="fw-bold fs-5">${formattedAcres || 'N/A'}</div>
        </div>
      </div>
    ` : '';

    const html = `
      <div class="row mb-3">
        <div class="col-12">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-2">
              <li class="breadcrumb-item"><a href="#home">Home</a></li>
              <li class="breadcrumb-item"><a href="#discover">Discover</a></li>
              <li class="breadcrumb-item active">${prop.title}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div class="row g-4">
        <!-- Left: Image Gallery & Description -->
        <div class="col-12 col-lg-8">
          <div class="bg-white border rounded-3 p-3 mb-4 shadow-sm">
            <div class="position-relative mb-2">
              <img id="detail-main-image" src="${images[0].display_url}" class="gallery-main-image" alt="${prop.title}">
              <span class="badge-property-type fs-6 px-3 py-2">${prop.property_type_display || prop.property_type}</span>
            </div>
            <div class="d-flex gap-2 overflow-auto py-2">
              ${thumbnailsHtml}
            </div>
          </div>

          <!-- Description & Specifications -->
          <div class="bg-white border rounded-3 p-4 mb-4 shadow-sm">
            <h3 class="fw-bold mb-3">${prop.title}</h3>
            <p class="text-muted mb-4 fs-5">
              <i class="bi bi-geo-alt-fill text-danger me-1"></i>
              ${prop.address}, ${prop.city}, ${prop.state} ${prop.zip_code}
            </p>

            ${residentialSpecs}

            <h5 class="fw-bold mb-3 border-bottom pb-2">Property Overview</h5>
            <div class="text-secondary mb-4" style="line-height: 1.7; white-space: pre-line;">
              ${prop.description}
            </div>

            <h5 class="fw-bold mb-3 border-bottom pb-2">Land & Development Specifications</h5>
            <div class="row g-3 mb-4">
              <div class="col-12 col-sm-6">
                <div class="border rounded p-3 h-100">
                  <div class="text-muted small">Zoning Classification</div>
                  <div class="fw-bold">${prop.zoning_classification || 'General / Unspecified'}</div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="border rounded p-3 h-100">
                  <div class="text-muted small">Road Access</div>
                  <div class="fw-bold">${prop.road_access ? '<i class="bi bi-check-circle-fill text-success me-1"></i> Paved / County Road' : '<i class="bi bi-x-circle-fill text-secondary me-1"></i> Unpaved / Easement'}</div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="border rounded p-3 h-100">
                  <div class="text-muted small">Water Rights & Supply</div>
                  <div class="fw-bold">${prop.water_rights ? '<i class="bi bi-check-circle-fill text-success me-1"></i> Adjudicated Water Rights / Well' : '<i class="bi bi-info-circle me-1"></i> Public Municipal / Haul'}</div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="border rounded p-3 h-100">
                  <div class="text-muted small">Electric Grid Connection</div>
                  <div class="fw-bold">${prop.electricity ? '<i class="bi bi-check-circle-fill text-success me-1"></i> On-Grid Electric Available' : '<i class="bi bi-info-circle me-1"></i> Off-Grid / Solar Potential'}</div>
                </div>
              </div>
              ${prop.soil_type ? `
              <div class="col-12 col-sm-6">
                <div class="border rounded p-3 h-100">
                  <div class="text-muted small">Soil Classification</div>
                  <div class="fw-bold">${prop.soil_type}</div>
                </div>
              </div>` : ''}
              ${prop.topography ? `
              <div class="col-12 col-sm-6">
                <div class="border rounded p-3 h-100">
                  <div class="text-muted small">Topography</div>
                  <div class="fw-bold">${prop.topography}</div>
                </div>
              </div>` : ''}
              ${prop.property_tax_annual ? `
              <div class="col-12 col-sm-6">
                <div class="border rounded p-3 h-100">
                  <div class="text-muted small">Estimated Annual Property Tax</div>
                  <div class="fw-bold">$${Number(prop.property_tax_annual).toLocaleString()} / year</div>
                </div>
              </div>` : ''}
            </div>

            <!-- Location Map -->
            <h5 class="fw-bold mb-3 border-bottom pb-2">Geographic Location</h5>
            <div id="property-detail-map" class="mb-2"></div>
            <p class="text-muted small">
              Coordinates: ${prop.latitude ? `${prop.latitude}, ${prop.longitude}` : 'Approximate boundary plotted based on municipal cadastral records.'}
            </p>
          </div>
        </div>

        <!-- Right: Price & Buyer Action Card + Seller Card -->
        <div class="col-12 col-lg-4">
          <div class="card border rounded-3 p-4 mb-4 shadow-sm position-sticky" style="top: 85px;">
            <div class="text-muted small fw-semibold text-uppercase">Listed Price</div>
            <div class="fs-1 fw-bold text-success mb-1">$${formattedPrice}</div>
            ${pricePerAcre ? `<div class="text-muted small mb-3">${pricePerAcre}</div>` : ''}

            <div class="d-flex flex-column gap-2 my-3">
              <button class="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2" onclick="PropertyDetail.startChat()">
                <i class="bi bi-chat-dots-fill"></i> Contact Seller & Chat
              </button>
              
              <button class="btn btn-outline-primary btn-lg d-flex align-items-center justify-content-center gap-2" onclick="Cart.addItem(${prop.id})">
                <i class="bi bi-cart-plus-fill"></i> Add to Consideration Cart
              </button>

              <button id="btn-detail-favorite" class="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2" onclick="PropertyDetail.toggleFavorite()">
                <i class="bi bi-heart"></i> Save to Favorites
              </button>
            </div>

            <hr class="my-3">

            <!-- Seller Profile Preview -->
            <div class="seller-card">
              <h6 class="fw-bold text-muted text-uppercase mb-3 small">Listing Agent & Seller</h6>
              <div class="d-flex align-items-center gap-3 mb-3">
                <img src="${prop.seller?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(prop.seller?.full_name || 'Seller')}&background=1b4332&color=fff`}" 
                     class="rounded-circle" width="56" height="56" alt="Seller avatar">
                <div>
                  <h6 class="fw-bold mb-0">${prop.seller?.full_name || prop.seller?.username}</h6>
                  <div class="text-muted small">${prop.seller?.company_name || 'Independent Property Owner'}</div>
                  ${prop.seller?.license_number ? `<span class="badge bg-light text-dark border small">Lic #${prop.seller.license_number}</span>` : ''}
                </div>
              </div>
              <p class="text-muted small mb-3">${prop.seller?.bio || 'Experienced real estate specialist focused on land, residential, and agricultural assets.'}</p>
              
              <div class="bg-light p-3 rounded-2 small mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-muted">Direct Email:</span>
                  <span class="fw-medium">${prop.seller?.email || 'Available upon inquiry'}</span>
                </div>
                ${prop.seller?.phone_number ? `
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Office Phone:</span>
                  <span class="fw-medium">${prop.seller.phone_number}</span>
                </div>` : ''}
              </div>

              <!-- Report Listing -->
              <div class="text-center pt-2">
                <button class="btn btn-sm btn-link text-muted text-decoration-none" onclick="PropertyDetail.openReportModal()">
                  <i class="bi bi-flag me-1"></i> Report an issue with this listing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  setMainImage(url, thumbEl) {
    const mainImg = document.getElementById('detail-main-image');
    if (mainImg) mainImg.src = url;

    document.querySelectorAll('.gallery-thumbnail').forEach(el => el.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
  },

  initMiniMap(prop) {
    const mapEl = document.getElementById('property-detail-map');
    if (!mapEl || !window.L) return;

    const lat = prop.latitude || 39.8283;
    const lng = prop.longitude || -98.5795;
    const zoom = prop.latitude ? 13 : 4;

    try {
      if (this.mapInstance) {
        this.mapInstance.remove();
        this.mapInstance = null;
      }

      this.mapInstance = L.map('property-detail-map', {
        center: [lat, lng],
        zoom: zoom,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.mapInstance);

      if (prop.latitude && prop.longitude) {
        L.marker([lat, lng]).addTo(this.mapInstance)
          .bindPopup(`<strong>${prop.title}</strong><br>$${Number(prop.price).toLocaleString()}`)
          .openPopup();
      }
    } catch (e) {
      console.warn('MiniMap initialization note:', e);
    }
  },

  async checkFavoriteStatus(propertyId) {
    if (!Auth.isAuthenticated()) return;
    try {
      const res = await API.get(`/favorites/check/${propertyId}/`);
      const btn = document.getElementById('btn-detail-favorite');
      if (btn) {
        if (res.is_favorite) {
          btn.innerHTML = '<i class="bi bi-heart-fill"></i> Saved in Favorites';
          btn.classList.remove('btn-outline-danger');
          btn.classList.add('btn-danger');
        } else {
          btn.innerHTML = '<i class="bi bi-heart"></i> Save to Favorites';
          btn.classList.add('btn-outline-danger');
          btn.classList.remove('btn-danger');
        }
      }
    } catch (e) {}
  },

  async toggleFavorite() {
    if (!Auth.isAuthenticated()) {
      API.showToast('Please log in to save favorites.', 'error');
      App.showAuthModal('login');
      return;
    }
    if (!this.currentProperty) return;

    await Favorites.toggle(this.currentProperty.id);
    this.checkFavoriteStatus(this.currentProperty.id);
  },

  async startChat() {
    if (!Auth.isAuthenticated()) {
      API.showToast('Please log in to chat with the seller.', 'error');
      App.showAuthModal('login');
      return;
    }

    if (this.currentProperty.seller?.id === Auth.currentUser.id) {
      API.showToast('You cannot start a chat with yourself.', 'error');
      return;
    }

    // Open chat with this property
    try {
      const conv = await API.post('/chat/conversations/', {
        property_id: this.currentProperty.id,
        message: `Hello, I am interested in "${this.currentProperty.title}" and would like to learn more.`
      });

      window.location.hash = `#chat?id=${conv.id}`;
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  openReportModal() {
    if (!Auth.isAuthenticated()) {
      API.showToast('Please log in to submit a report.', 'error');
      App.showAuthModal('login');
      return;
    }

    const modalEl = document.getElementById('modal-report-listing');
    if (modalEl) {
      document.getElementById('report-property-id').value = this.currentProperty.id;
      document.getElementById('report-property-title').textContent = this.currentProperty.title;
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }
};

window.PropertyDetail = PropertyDetail;
