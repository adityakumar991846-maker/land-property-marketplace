/**
 * TerraTrade Marketplace - Properties Search & Listing Module
 */

const Properties = {
  state: {
    q: '',
    location: '',
    property_type: '',
    min_price: '',
    max_price: '',
    min_area: '',
    max_area: '',
    bedrooms: '',
    road_access: '',
    sort_by: 'newest',
    page: 1,
    userLat: null,
    userLng: null,
    radius_km: 100,
    isNearbyActive: false,
    viewMode: 'grid', // 'grid' or 'map'
  },

  async loadFeatured() {
    const container = document.getElementById('featured-properties-container');
    if (!container) return;

    try {
      const data = await API.get('/properties/featured/');
      const properties = data.results || data;

      if (!properties || properties.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted py-4">No featured properties available at this moment.</div>';
        return;
      }

      container.innerHTML = properties.map(prop => this.renderPropertyCard(prop)).join('');
    } catch (err) {
      container.innerHTML = `<div class="col-12 text-center text-danger py-4">Failed to load featured properties: ${err.message}</div>`;
    }
  },

  async searchProperties(resetPage = false) {
    if (resetPage) {
      this.state.page = 1;
    }

    const container = document.getElementById('properties-grid-container');
    const loadingEl = document.getElementById('properties-loading');
    const countEl = document.getElementById('properties-count-badge');
    const paginationEl = document.getElementById('properties-pagination');

    if (loadingEl) loadingEl.classList.remove('d-none');
    if (container) container.innerHTML = '';

    const params = {
      page: this.state.page,
      sort_by: this.state.sort_by,
    };

    if (this.state.q) params.q = this.state.q;
    if (this.state.location) params.location = this.state.location;
    if (this.state.property_type) params.property_type = this.state.property_type;
    if (this.state.min_price) params.min_price = this.state.min_price;
    if (this.state.max_price) params.max_price = this.state.max_price;
    if (this.state.min_area) params.min_area = this.state.min_area;
    if (this.state.max_area) params.max_area = this.state.max_area;
    if (this.state.bedrooms) params.bedrooms = this.state.bedrooms;
    if (this.state.road_access) params.road_access = this.state.road_access;

    if (this.state.isNearbyActive && this.state.userLat && this.state.userLng) {
      params.lat = this.state.userLat;
      params.lng = this.state.userLng;
      params.radius_km = this.state.radius_km;
      params.sort_by = 'distance';
    }

    try {
      const data = await API.get('/properties/', params);
      const items = data.results || (Array.isArray(data) ? data : []);
      const totalCount = data.count !== undefined ? data.count : items.length;

      if (loadingEl) loadingEl.classList.add('d-none');

      if (countEl) {
        countEl.textContent = `${totalCount} ${totalCount === 1 ? 'property' : 'properties'} found`;
      }

      if (items.length === 0) {
        if (container) {
          container.innerHTML = `
            <div class="col-12">
              <div class="empty-state bg-white border rounded-3 p-5 my-3">
                <i class="bi bi-geo-alt-fill empty-state-icon"></i>
                <h4 class="fw-bold mb-2">No properties matched your criteria</h4>
                <p class="text-muted mb-4">Try adjusting your filters, expanding your price range, or searching a wider geographic area.</p>
                <button class="btn btn-outline-primary" onclick="Properties.resetFilters()">
                  <i class="bi bi-arrow-counterclockwise me-1"></i> Reset All Filters
                </button>
              </div>
            </div>
          `;
        }
        if (paginationEl) paginationEl.innerHTML = '';
        return;
      }

      if (container) {
        container.innerHTML = items.map(prop => this.renderPropertyCard(prop)).join('');
      }

      // Sync map markers if Map module is active
      if (window.PropertyMap && typeof window.PropertyMap.updateMarkers === 'function') {
        window.PropertyMap.updateMarkers(items);
      }

      // Render pagination
      this.renderPagination(data, paginationEl);

    } catch (err) {
      if (loadingEl) loadingEl.classList.add('d-none');
      if (container) {
        container.innerHTML = `
          <div class="col-12">
            <div class="alert alert-danger my-3" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i> Error loading listings: ${err.message}
            </div>
          </div>
        `;
      }
    }
  },

  renderPropertyCard(prop) {
    const formattedPrice = Number(prop.price).toLocaleString();
    const areaText = prop.area_acres ? `${prop.area_acres} Acres` : prop.area_sqft ? `${Number(prop.area_sqft).toLocaleString()} sq ft` : '';
    const distanceBadge = prop.distance_km !== null && prop.distance_km !== undefined
      ? `<span class="badge bg-primary me-1"><i class="bi bi-geo me-1"></i>${prop.distance_km} km away</span>`
      : '';

    const bedroomBadge = prop.bedrooms ? `<span class="badge bg-light text-dark border me-1"><i class="bi bi-door-closed me-1"></i>${prop.bedrooms} Beds</span>` : '';

    return `
      <div class="col-12 col-md-6 col-lg-4 mb-4">
        <div class="property-card shadow-sm h-100" data-property-id="${prop.id}">
          <div class="card-image-wrapper">
            <img src="${prop.cover_image}" alt="${prop.title}" loading="lazy">
            <span class="badge-property-type">${prop.property_type_display || prop.property_type}</span>
            <button class="btn-card-favorite" title="Save to Favorites" onclick="Favorites.toggle(${prop.id}, this); event.stopPropagation();">
              <i class="bi bi-heart"></i>
            </button>
          </div>
          
          <div class="p-3 d-flex flex-column flex-grow-1">
            <div class="d-flex justify-content-between align-items-baseline mb-1">
              <span class="property-card-price">$${formattedPrice}</span>
              ${areaText ? `<span class="badge bg-light text-dark border fw-medium">${areaText}</span>` : ''}
            </div>

            <h5 class="property-card-title mb-2" title="${prop.title}">
              <a href="#property?id=${prop.id}" class="text-decoration-none text-dark">${prop.title}</a>
            </h5>

            <p class="text-muted small mb-2 text-truncate">
              <i class="bi bi-geo-alt-fill text-danger me-1"></i>${prop.city}, ${prop.state} ${prop.zip_code ? prop.zip_code : ''}
            </p>

            <div class="mb-3">
              ${distanceBadge}
              ${bedroomBadge}
            </div>

            <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
              <div class="small text-muted text-truncate me-2" style="max-width: 140px;">
                <i class="bi bi-person-circle me-1"></i>${prop.seller_company || prop.seller_name || 'Verified Seller'}
              </div>
              
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary" title="Add to Consideration Shortlist" onclick="Cart.addItem(${prop.id}); event.stopPropagation();">
                  <i class="bi bi-cart-plus"></i>
                </button>
                <a href="#property?id=${prop.id}" class="btn btn-sm btn-primary">
                  View Details
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderPagination(data, container) {
    if (!container || !data.count || data.count <= 12) {
      if (container) container.innerHTML = '';
      return;
    }

    const pageSize = data.page_size || 12;
    const totalPages = data.total_pages || Math.ceil(data.count / pageSize);
    const currentPage = this.state.page;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, data.count);

    let html = `
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center my-4 gap-3">
        <div class="text-muted small">
          Showing <strong>${startItem}–${endItem}</strong> of <strong>${data.count}</strong> properties (Page ${currentPage} of ${totalPages})
        </div>
        <ul class="pagination mb-0">
          <!-- Previous -->
          <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" ${currentPage === 1 ? 'tabindex="-1" aria-disabled="true"' : `onclick="Properties.goToPage(${currentPage - 1})"`}>
              <i class="bi bi-chevron-left me-1"></i> Previous
            </a>
          </li>
    `;

    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)) {
        html += `
          <li class="page-item ${p === currentPage ? 'active' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="Properties.goToPage(${p})">${p}</a>
          </li>
        `;
      } else if (p === currentPage - 3 || p === currentPage + 3) {
        html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
      }
    }

    // Next
    html += `
          <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" ${currentPage === totalPages ? 'tabindex="-1" aria-disabled="true"' : `onclick="Properties.goToPage(${currentPage + 1})"`}>
              Next <i class="bi bi-chevron-right ms-1"></i>
            </a>
          </li>
        </ul>
      </div>
    `;

    container.innerHTML = html;
  },

  goToPage(pageNum) {
    this.state.page = pageNum;
    this.searchProperties(false);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  },

  requestNearbyLocation() {
    const statusEl = document.getElementById('nearby-status-text');
    const buttonEl = document.getElementById('btn-nearby-toggle');

    if (!navigator.geolocation) {
      API.showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    if (this.state.isNearbyActive) {
      // Turn off
      this.state.isNearbyActive = false;
      this.state.userLat = null;
      this.state.userLng = null;
      if (statusEl) statusEl.textContent = 'Use Current Location';
      if (buttonEl) buttonEl.classList.remove('btn-success', 'active');
      if (window.PropertyMap && typeof window.PropertyMap.clearNearbyRadius === 'function') {
        window.PropertyMap.clearNearbyRadius();
      }
      API.showToast('Nearby filter disabled');
      this.searchProperties(true);
      return;
    }

    if (statusEl) statusEl.textContent = 'Requesting location...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.state.userLat = position.coords.latitude;
        this.state.userLng = position.coords.longitude;
        this.state.isNearbyActive = true;
        this.state.sort_by = 'distance';

        if (statusEl) statusEl.textContent = 'Nearby Mode Active';
        if (buttonEl) buttonEl.classList.add('btn-success', 'active');

        // Draw visual radius circle on map
        if (window.PropertyMap && typeof window.PropertyMap.setNearbyRadius === 'function') {
          window.PropertyMap.setNearbyRadius(this.state.userLat, this.state.userLng, this.state.radius_km);
        }

        API.showToast('Location acquired! Showing listings near you.', 'success');
        this.searchProperties(true);
      },
      (error) => {
        console.warn('Geolocation permission error:', error);
        this.state.isNearbyActive = false;
        if (statusEl) statusEl.textContent = 'Location Permission Denied';
        if (window.PropertyMap && typeof window.PropertyMap.clearNearbyRadius === 'function') {
          window.PropertyMap.clearNearbyRadius();
        }
        API.showToast('Location permission was not granted. Please enter your city or state in the location field.', 'error');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  },

  resetFilters() {
    this.state.q = '';
    this.state.location = '';
    this.state.property_type = '';
    this.state.min_price = '';
    this.state.max_price = '';
    this.state.min_area = '';
    this.state.max_area = '';
    this.state.bedrooms = '';
    this.state.road_access = '';
    this.state.sort_by = 'newest';
    this.state.isNearbyActive = false;
    this.state.userLat = null;
    this.state.userLng = null;

    if (window.PropertyMap && typeof window.PropertyMap.clearNearbyRadius === 'function') {
      window.PropertyMap.clearNearbyRadius();
    }

    // Reset input fields
    const inputs = ['search-keyword', 'search-location', 'filter-property-type', 'filter-min-price', 'filter-max-price', 'filter-min-area', 'filter-max-area', 'filter-bedrooms', 'filter-sort-by'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    const nearbyBtn = document.getElementById('btn-nearby-toggle');
    if (nearbyBtn) nearbyBtn.classList.remove('btn-success', 'active');
    const nearbyStatus = document.getElementById('nearby-status-text');
    if (nearbyStatus) nearbyStatus.textContent = 'Use Current Location';

    this.searchProperties(true);
  }
};

window.Properties = Properties;
