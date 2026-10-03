/**
 * TerraTrade Marketplace - Seller Dashboard Module
 */

const Seller = {
  listings: [],
  editingId: null,
  selectedFiles: [], // Array of { file, isCover, previewUrl }

  async load() {
    const container = document.getElementById('seller-dashboard-container');
    if (!container) return;

    if (!Auth.isAuthenticated()) {
      container.innerHTML = `
        <div class="empty-state bg-white border rounded-3 p-5 my-4">
          <i class="bi bi-person-lock empty-state-icon"></i>
          <h4>Log in to access Seller Dashboard</h4>
          <p class="text-muted">Create property listings, manage inquiries from interested buyers, and update listing statuses.</p>
          <button class="btn btn-primary" onclick="App.showAuthModal('login')">Log In to Sell</button>
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
      const data = await API.get('/properties/seller/listings/');
      this.listings = data.results || (Array.isArray(data) ? data : []);
      this.render(container);
    } catch (err) {
      container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  },

  render(container) {
    const totalListings = this.listings.length;
    const activeListings = this.listings.filter(p => p.status === 'published').length;
    const soldListings = this.listings.filter(p => p.status === 'sold').length;
    const draftListings = this.listings.filter(p => p.status === 'draft' || p.status === 'unpublished').length;

    const tableRowsHtml = this.listings.map(p => {
      const formattedPrice = Number(p.price).toLocaleString();
      const statusBadge = p.status === 'published' ? '<span class="badge bg-success">Published</span>'
        : p.status === 'sold' ? '<span class="badge bg-secondary">Sold</span>'
        : p.status === 'pending' ? '<span class="badge bg-warning text-dark">Pending</span>'
        : p.status === 'rejected' ? '<span class="badge bg-danger">Rejected</span>'
        : '<span class="badge bg-light text-dark border">Unpublished</span>';

      return `
        <tr id="seller-prop-${p.id}">
          <td style="width: 80px;">
            <img src="${p.cover_image}" class="rounded object-fit-cover" width="70" height="50" alt="${p.title}">
          </td>
          <td>
            <div class="fw-bold">${p.title}</div>
            <div class="text-muted small">${p.city}, ${p.state} • ${p.area_acres ? p.area_acres + ' Acres' : ''}</div>
          </td>
          <td>
            <span class="badge bg-light text-dark border">${p.property_type_display || p.property_type}</span>
          </td>
          <td class="fw-bold text-success">$${formattedPrice}</td>
          <td>${statusBadge}</td>
          <td>
            <span class="text-muted small"><i class="bi bi-eye me-1"></i>${p.views_count || 0}</span>
          </td>
          <td class="text-end">
            <div class="dropdown">
              <button class="btn btn-sm btn-light border dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Actions
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                <li><a class="dropdown-item" href="#property?id=${p.id}"><i class="bi bi-box-arrow-up-right me-2"></i>View Public Listing</a></li>
                <li><button class="dropdown-item" onclick="Seller.editListing(${p.id})"><i class="bi bi-pencil me-2"></i>Edit Details</button></li>
                <li><hr class="dropdown-divider"></li>
                ${p.status !== 'published' ? `
                  <li><button class="dropdown-item text-success" onclick="Seller.changeStatus(${p.id}, 'publish')"><i class="bi bi-check-circle me-2"></i>Publish Listing</button></li>
                ` : `
                  <li><button class="dropdown-item text-warning" onclick="Seller.changeStatus(${p.id}, 'unpublish')"><i class="bi bi-pause-circle me-2"></i>Unpublish Listing</button></li>
                `}
                ${p.status !== 'sold' ? `
                  <li><button class="dropdown-item text-primary" onclick="Seller.changeStatus(${p.id}, 'mark_sold')"><i class="bi bi-tag-fill me-2"></i>Mark as Sold</button></li>
                ` : ''}
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item text-danger" onclick="Seller.deleteListing(${p.id})"><i class="bi bi-trash me-2"></i>Delete</button></li>
              </ul>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 class="fw-bold mb-1">Seller Dashboard</h3>
          <p class="text-muted mb-0">Manage land parcels, properties, inquiries, and track sales performance.</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-2" onclick="Seller.openCreateModal()">
          <i class="bi bi-plus-circle-fill"></i> Add New Property
        </button>
      </div>

      <!-- Stat Cards -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card stat-card border-0 shadow-xs p-3">
            <div class="text-muted small">Total Properties</div>
            <div class="stat-card-value text-dark">${totalListings}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card stat-card border-0 shadow-xs p-3">
            <div class="text-muted small">Active Listings</div>
            <div class="stat-card-value text-success">${activeListings}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card stat-card border-0 shadow-xs p-3">
            <div class="text-muted small">Sold Parcels</div>
            <div class="stat-card-value text-primary">${soldListings}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card stat-card border-0 shadow-xs p-3">
            <div class="text-muted small">Unpublished / Drafts</div>
            <div class="stat-card-value text-secondary">${draftListings}</div>
          </div>
        </div>
      </div>

      <!-- Listings Table -->
      <div class="card border rounded-3 shadow-sm bg-white">
        <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Your Property Portfolio</h5>
          <span class="badge bg-secondary-subtle text-secondary">${totalListings} Listings</span>
        </div>
        <div class="table-responsive">
          <table class="table align-middle mb-0 table-hover">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th>Photo</th>
                <th>Listing Title & Location</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Views</th>
                <th class="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              ${this.listings.length > 0 ? tableRowsHtml : `
                <tr>
                  <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-building-add fs-1 d-block mb-2 text-secondary"></i>
                    You have not published any properties yet.
                    <div class="mt-2">
                      <button class="btn btn-sm btn-outline-primary" onclick="Seller.openCreateModal()">Create Your First Listing</button>
                    </div>
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  openCreateModal() {
    this.editingId = null;
    this.resetImagePreviews();
    const form = document.getElementById('form-property-listing');
    if (form) form.reset();

    const titleEl = document.getElementById('modal-property-listing-title');
    if (titleEl) titleEl.textContent = 'Create New Property Listing';

    this.toggleResidentialFields('agricultural_land');

    const modalEl = document.getElementById('modal-property-listing');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  },

  async editListing(id) {
    this.editingId = id;
    this.resetImagePreviews();

    try {
      const prop = await API.get(`/properties/seller/listings/${id}/`);

      const form = document.getElementById('form-property-listing');
      if (!form) return;

      document.getElementById('prop-form-title').value = prop.title || '';
      document.getElementById('prop-form-type').value = prop.property_type || 'agricultural_land';
      document.getElementById('prop-form-price').value = prop.price || '';
      document.getElementById('prop-form-acres').value = prop.area_acres || '';
      document.getElementById('prop-form-sqft').value = prop.area_sqft || '';
      document.getElementById('prop-form-address').value = prop.address || '';
      document.getElementById('prop-form-city').value = prop.city || '';
      document.getElementById('prop-form-state').value = prop.state || '';
      document.getElementById('prop-form-zip').value = prop.zip_code || '';
      document.getElementById('prop-form-lat').value = prop.latitude || '';
      document.getElementById('prop-form-lng').value = prop.longitude || '';
      document.getElementById('prop-form-zoning').value = prop.zoning_classification || '';
      document.getElementById('prop-form-soil').value = prop.soil_type || '';
      document.getElementById('prop-form-topography').value = prop.topography || '';
      document.getElementById('prop-form-taxes').value = prop.property_tax_annual || '';
      document.getElementById('prop-form-description').value = prop.description || '';
      document.getElementById('prop-form-road-access').checked = !!prop.road_access;
      document.getElementById('prop-form-water-rights').checked = !!prop.water_rights;
      document.getElementById('prop-form-electricity').checked = !!prop.electricity;

      // Residential
      if (document.getElementById('prop-form-bedrooms')) {
        document.getElementById('prop-form-bedrooms').value = prop.bedrooms || '';
      }
      if (document.getElementById('prop-form-bathrooms')) {
        document.getElementById('prop-form-bathrooms').value = prop.bathrooms || '';
      }

      this.toggleResidentialFields(prop.property_type);

      const titleEl = document.getElementById('modal-property-listing-title');
      if (titleEl) titleEl.textContent = 'Edit Property Listing';

      const modalEl = document.getElementById('modal-property-listing');
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  toggleResidentialFields(propertyType) {
    const residentialBox = document.getElementById('residential-specs-box');
    if (residentialBox) {
      const isResidential = propertyType === 'house' || propertyType === 'apartment';
      residentialBox.classList.toggle('d-none', !isResidential);
    }
  },

  handleFileSelection(event) {
    const input = event.target;
    if (!input || !input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    files.forEach((file, index) => {
      // Validate file size
      if (file.size > maxSizeBytes) {
        API.showToast(`File "${file.name}" exceeds the 5MB maximum limit and was skipped.`, 'error');
        return;
      }

      // Validate MIME type
      if (!allowedTypes.includes(file.type)) {
        API.showToast(`File "${file.name}" is not a valid JPEG, PNG, or WEBP image and was skipped.`, 'error');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      const isCover = this.selectedFiles.length === 0 && index === 0;

      this.selectedFiles.push({
        file,
        isCover,
        previewUrl
      });
    });

    this.renderFilePreviews();
    input.value = ''; // Reset input so same file can be re-selected if removed
  },

  renderFilePreviews() {
    const container = document.getElementById('prop-image-previews-container');
    if (!container) return;

    if (this.selectedFiles.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = this.selectedFiles.map((item, index) => `
      <div class="position-relative border rounded p-1 bg-white shadow-xs" style="width: 110px;">
        <img src="${item.previewUrl}" class="rounded object-fit-cover w-100" style="height: 75px;" alt="Preview">
        <div class="mt-1 d-flex justify-content-between align-items-center">
          <button type="button" class="btn btn-xs ${item.isCover ? 'btn-success' : 'btn-outline-secondary'}" 
                  style="font-size: 0.68rem; padding: 1px 5px;" 
                  onclick="Seller.setCoverFile(${index})">
            ${item.isCover ? 'Cover' : 'Set Cover'}
          </button>
          <button type="button" class="btn btn-xs text-danger p-0" 
                  title="Remove image" 
                  onclick="Seller.removeSelectedFile(${index})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
        <div class="text-truncate text-muted" style="font-size: 0.65rem;" title="${item.file.name}">
          ${item.file.name}
        </div>
      </div>
    `).join('');
  },

  removeSelectedFile(index) {
    if (index >= 0 && index < this.selectedFiles.length) {
      const removed = this.selectedFiles.splice(index, 1)[0];
      if (removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      if (removed.isCover && this.selectedFiles.length > 0) {
        this.selectedFiles[0].isCover = true;
      }
      this.renderFilePreviews();
    }
  },

  setCoverFile(index) {
    this.selectedFiles.forEach((item, i) => {
      item.isCover = (i === index);
    });
    this.renderFilePreviews();
  },

  resetImagePreviews() {
    this.selectedFiles.forEach(item => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    this.selectedFiles = [];
    const container = document.getElementById('prop-image-previews-container');
    if (container) container.innerHTML = '';
    const statusEl = document.getElementById('prop-upload-status');
    if (statusEl) {
      statusEl.classList.add('d-none');
      statusEl.textContent = '';
    }
  },

  async handleFormSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('prop-form-title').value.trim();
    const propertyType = document.getElementById('prop-form-type').value;
    const price = parseFloat(document.getElementById('prop-form-price').value);
    const areaAcres = parseFloat(document.getElementById('prop-form-acres').value) || null;
    const areaSqft = parseFloat(document.getElementById('prop-form-sqft').value) || null;
    const address = document.getElementById('prop-form-address').value.trim();
    const city = document.getElementById('prop-form-city').value.trim();
    const state = document.getElementById('prop-form-state').value.trim();
    const zipCode = document.getElementById('prop-form-zip').value.trim();
    const latitude = parseFloat(document.getElementById('prop-form-lat').value) || null;
    const longitude = parseFloat(document.getElementById('prop-form-lng').value) || null;
    const zoning = document.getElementById('prop-form-zoning').value.trim();
    const soil = document.getElementById('prop-form-soil').value.trim();
    const topography = document.getElementById('prop-form-topography').value.trim();
    const taxes = parseFloat(document.getElementById('prop-form-taxes').value) || null;
    const description = document.getElementById('prop-form-description').value.trim();
    const roadAccess = document.getElementById('prop-form-road-access').checked;
    const waterRights = document.getElementById('prop-form-water-rights').checked;
    const electricity = document.getElementById('prop-form-electricity').checked;

    const photosInput = document.getElementById('prop-form-images')?.value?.trim() || '';
    const imagesUrls = photosInput
      ? photosInput.split('\n').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    if (!title || !price || !address || !city || !state || !description) {
      API.showToast('Please fill out all required fields marked with an asterisk (*).', 'error');
      return;
    }

    if (price <= 0) {
      API.showToast('Price must be greater than zero.', 'error');
      return;
    }

    const payload = {
      title,
      property_type: propertyType,
      price,
      area_acres: areaAcres,
      area_sqft: areaSqft,
      address,
      city,
      state,
      zip_code: zipCode,
      latitude,
      longitude,
      zoning_classification: zoning,
      soil_type: soil,
      topography,
      property_tax_annual: taxes,
      description,
      road_access: roadAccess,
      water_rights: waterRights,
      electricity: electricity,
      status: 'published'
    };

    if (propertyType === 'house' || propertyType === 'apartment') {
      const beds = parseInt(document.getElementById('prop-form-bedrooms').value);
      const baths = parseFloat(document.getElementById('prop-form-bathrooms').value);
      if (!isNaN(beds)) payload.bedrooms = beds;
      if (!isNaN(baths)) payload.bathrooms = baths;
    }

    const statusEl = document.getElementById('prop-upload-status');

    try {
      let savedProp = null;
      if (this.editingId) {
        savedProp = await API.put(`/properties/seller/listings/${this.editingId}/`, payload);
        API.showToast('Listing updated successfully!');
      } else {
        savedProp = await API.post('/properties/seller/listings/', payload);
        API.showToast('Listing created successfully!');
      }

      const propId = savedProp.id || this.editingId;

      // Upload selected file images via multipart/form-data
      if (this.selectedFiles.length > 0 && propId) {
        if (statusEl) {
          statusEl.classList.remove('d-none');
          statusEl.innerHTML = `<span class="spinner-border spinner-border-sm me-1 text-primary"></span> Uploading ${this.selectedFiles.length} property photo(s)...`;
        }

        for (let i = 0; i < this.selectedFiles.length; i++) {
          const item = this.selectedFiles[i];
          const formData = new FormData();
          formData.append('image', item.file);
          formData.append('is_cover', item.isCover ? 'true' : 'false');
          formData.append('caption', item.file.name);

          await API.post(`/properties/seller/listings/${propId}/images/`, formData);
        }
      }

      // Upload any optional external image URLs
      if (imagesUrls.length > 0 && propId) {
        for (const url of imagesUrls) {
          await API.post(`/properties/seller/listings/${propId}/images/`, {
            image_url: url,
            is_cover: false
          });
        }
      }

      this.resetImagePreviews();

      // Hide modal
      const modalEl = document.getElementById('modal-property-listing');
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }

      // Refresh seller dashboard and auth profile (seller flag)
      await Auth.init();
      this.load();
    } catch (err) {
      if (statusEl) {
        statusEl.classList.remove('d-none');
        statusEl.innerHTML = `<span class="text-danger"><i class="bi bi-exclamation-circle me-1"></i>${err.message}</span>`;
      }
      API.showToast(err.message, 'error');
    }
  },

  async changeStatus(id, action) {
    try {
      const res = await API.post(`/properties/seller/listings/${id}/${action}/`);
      API.showToast(res.message);
      this.load();
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async deleteListing(id) {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      const res = await API.delete(`/properties/seller/listings/${id}/`);
      API.showToast(res.message);
      this.load();
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  }
};

window.Seller = Seller;
