/**
 * TerraTrade Marketplace - Admin Portal Module
 * Restricted to Platform Administrators and Staff
 */

const Admin = {
  currentTab: 'overview',
  stats: null,

  async load() {
    const container = document.getElementById('admin-portal-container');
    if (!container) return;

    if (!Auth.isAdmin()) {
      container.innerHTML = `
        <div class="empty-state bg-white border rounded-3 p-5 my-4">
          <i class="bi bi-shield-lock-fill empty-state-icon text-danger"></i>
          <h4>Administrator Access Required</h4>
          <p class="text-muted">You do not have administrative privileges to view the platform moderation portal.</p>
          <button class="btn btn-outline-primary" onclick="Auth.demoLogin('admin')">
            <i class="bi bi-person-check-fill me-1"></i> Switch to Demo Admin Account
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Loading administrative portal...</p>
      </div>
    `;

    try {
      const data = await API.get('/admin/stats/');
      this.stats = data;
      this.render(container);
    } catch (err) {
      container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  },

  render(container) {
    const s = this.stats.stats;

    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">
            <i class="bi bi-shield-check text-primary me-2"></i>Administration & Moderation Portal
          </h3>
          <p class="text-muted mb-0">Platform overview, user accounts, listing verification, and trust & safety reports.</p>
        </div>
        <div class="badge bg-danger fs-6 px-3 py-2">
          <i class="bi bi-person-badge-fill me-1"></i> Staff Clearance
        </div>
      </div>

      <!-- Navigation Tabs -->
      <ul class="nav nav-pills mb-4 bg-white p-2 rounded-3 border shadow-sm" id="admin-tabs" role="tablist">
        <li class="nav-item">
          <button class="nav-link active" onclick="Admin.switchTab('overview', this)">
            <i class="bi bi-speedometer2 me-1"></i> Overview
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" onclick="Admin.switchTab('users', this)">
            <i class="bi bi-people-fill me-1"></i> User Accounts (${s.total_users})
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" onclick="Admin.switchTab('properties', this)">
            <i class="bi bi-houses-fill me-1"></i> Property Moderation (${s.total_properties})
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" onclick="Admin.switchTab('reports', this)">
            <i class="bi bi-flag-fill me-1"></i> Trust & Reports 
            ${s.pending_reports > 0 ? `<span class="badge bg-danger ms-1">${s.pending_reports}</span>` : ''}
          </button>
        </li>
      </ul>

      <!-- Tab Content Area -->
      <div id="admin-tab-content">
        ${this.renderOverviewTab()}
      </div>
    `;
  },

  switchTab(tabName, btnEl) {
    this.currentTab = tabName;
    document.querySelectorAll('#admin-tabs .nav-link').forEach(el => el.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    const contentArea = document.getElementById('admin-tab-content');
    if (!contentArea) return;

    if (tabName === 'overview') {
      contentArea.innerHTML = this.renderOverviewTab();
    } else if (tabName === 'users') {
      this.loadUsersTab(contentArea);
    } else if (tabName === 'properties') {
      this.loadPropertiesTab(contentArea);
    } else if (tabName === 'reports') {
      this.loadReportsTab(contentArea);
    }
  },

  renderOverviewTab() {
    const s = this.stats.stats;
    const recentUsers = this.stats.recent_users || [];
    const recentProps = this.stats.recent_properties || [];
    const recentReports = this.stats.recent_reports || [];

    return `
      <!-- High-level Stats -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="metric-card shadow-sm border-start border-4 border-primary">
            <div class="text-muted small">Total Registered Users</div>
            <div class="fs-2 fw-bold text-dark">${s.total_users}</div>
            <div class="small text-muted">${s.total_sellers} Sellers • ${s.total_buyers} Buyers</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="metric-card shadow-sm border-start border-4 border-success">
            <div class="text-muted small">Active Published Listings</div>
            <div class="fs-2 fw-bold text-success">${s.active_properties}</div>
            <div class="small text-muted">${s.sold_properties} Closed Sales</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="metric-card shadow-sm border-start border-4 border-warning">
            <div class="text-muted small">Pending / Under Review</div>
            <div class="fs-2 fw-bold text-warning">${s.pending_properties}</div>
            <div class="small text-muted">${s.rejected_properties} Rejected</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="metric-card shadow-sm border-start border-4 border-danger">
            <div class="text-muted small">Pending User Reports</div>
            <div class="fs-2 fw-bold text-danger">${s.pending_reports}</div>
            <div class="small text-muted">${s.total_reports} Total Inquiries</div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Recent Properties -->
        <div class="col-12 col-lg-6">
          <div class="card border rounded-3 shadow-sm h-100 bg-white">
            <div class="card-header bg-white py-3 fw-bold d-flex justify-content-between align-items-center">
              <span>Recent Property Submissions</span>
              <button class="btn btn-sm btn-link p-0 text-decoration-none" onclick="Admin.switchTab('properties')">View All</button>
            </div>
            <ul class="list-group list-group-flush">
              ${recentProps.map(p => `
                <li class="list-group-item d-flex justify-content-between align-items-center py-3">
                  <div class="d-flex align-items-center gap-2 text-truncate me-2">
                    <img src="${p.cover_image}" class="rounded object-fit-cover" width="48" height="36" alt="">
                    <div class="text-truncate">
                      <div class="fw-bold small text-truncate">${p.title}</div>
                      <div class="text-muted" style="font-size: 0.75rem;">$${Number(p.price).toLocaleString()} • ${p.seller_name || 'Seller'}</div>
                    </div>
                  </div>
                  <span class="badge ${p.status === 'published' ? 'bg-success' : 'bg-secondary'}">${p.status}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

        <!-- Recent Users -->
        <div class="col-12 col-lg-6">
          <div class="card border rounded-3 shadow-sm h-100 bg-white">
            <div class="card-header bg-white py-3 fw-bold d-flex justify-content-between align-items-center">
              <span>Recently Registered Users</span>
              <button class="btn btn-sm btn-link p-0 text-decoration-none" onclick="Admin.switchTab('users')">View All</button>
            </div>
            <ul class="list-group list-group-flush">
              ${recentUsers.map(u => `
                <li class="list-group-item d-flex justify-content-between align-items-center py-3">
                  <div class="d-flex align-items-center gap-2">
                    <img src="${u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=1b4332&color=fff`}" 
                         class="rounded-circle" width="36" height="36" alt="">
                    <div>
                      <div class="fw-bold small">${u.full_name || u.username}</div>
                      <div class="text-muted" style="font-size: 0.75rem;">${u.email}</div>
                    </div>
                  </div>
                  <div>
                    ${u.is_seller ? '<span class="badge bg-primary-subtle text-primary me-1">Seller</span>' : '<span class="badge bg-light text-dark border me-1">Buyer</span>'}
                    ${u.is_staff ? '<span class="badge bg-danger">Staff</span>' : ''}
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  },

  async loadUsersTab(container) {
    container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>';
    try {
      const users = await API.get('/admin/users/');
      
      const rows = users.map(u => `
        <tr>
          <td>
            <div class="d-flex align-items-center gap-2">
              <img src="${u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=1b4332&color=fff`}" 
                   class="rounded-circle" width="36" height="36" alt="">
              <div>
                <div class="fw-bold">${u.full_name || u.username}</div>
                <div class="text-muted small">@${u.username}</div>
              </div>
            </div>
          </td>
          <td>${u.email}</td>
          <td>${u.company_name || '—'}</td>
          <td>
            ${u.is_seller ? '<span class="badge bg-success">Seller</span>' : '<span class="badge bg-secondary-subtle text-secondary">Buyer</span>'}
            ${u.is_staff ? '<span class="badge bg-danger ms-1">Admin</span>' : ''}
          </td>
          <td>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" ${u.is_active ? 'checked' : ''} 
                     onchange="Admin.toggleUserActive(${u.id}, this.checked)">
              <label class="form-check-label small">${u.is_active ? 'Active' : 'Disabled'}</label>
            </div>
          </td>
        </tr>
      `).join('');

      container.innerHTML = `
        <div class="card border rounded-3 shadow-sm bg-white overflow-hidden">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status & Access</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  },

  async toggleUserActive(userId, isActive) {
    try {
      await API.patch(`/admin/users/${userId}/`, { is_active: isActive });
      API.showToast(`User status updated to ${isActive ? 'Active' : 'Disabled'}`);
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async loadPropertiesTab(container) {
    container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>';
    try {
      const properties = await API.get('/admin/properties/');

      const rows = properties.map(p => `
        <tr id="admin-prop-${p.id}">
          <td style="width: 70px;">
            <img src="${p.cover_image}" class="rounded object-fit-cover" width="60" height="42" alt="">
          </td>
          <td>
            <div class="fw-bold">${p.title}</div>
            <div class="text-muted small">${p.city}, ${p.state} • Seller: ${p.seller_name || 'N/A'}</div>
          </td>
          <td>$${Number(p.price).toLocaleString()}</td>
          <td>
            <select class="form-select form-select-sm" style="width: 140px;" onchange="Admin.changePropertyStatus(${p.id}, this.value)">
              <option value="published" ${p.status === 'published' ? 'selected' : ''}>Published</option>
              <option value="pending" ${p.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="rejected" ${p.status === 'rejected' ? 'selected' : ''}>Rejected</option>
              <option value="sold" ${p.status === 'sold' ? 'selected' : ''}>Sold</option>
              <option value="unpublished" ${p.status === 'unpublished' ? 'selected' : ''}>Unpublished</option>
            </select>
          </td>
          <td>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" ${p.is_featured ? 'checked' : ''} 
                     onchange="Admin.togglePropertyFeatured(${p.id}, this.checked)">
              <label class="form-check-label small">${p.is_featured ? 'Featured' : 'Standard'}</label>
            </div>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-danger" onclick="Admin.deleteProperty(${p.id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');

      container.innerHTML = `
        <div class="card border rounded-3 shadow-sm bg-white overflow-hidden">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Photo</th>
                  <th>Listing Details</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  },

  async changePropertyStatus(id, newStatus) {
    try {
      await API.patch(`/admin/properties/${id}/`, { status: newStatus });
      API.showToast(`Listing status updated to ${newStatus}`);
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async togglePropertyFeatured(id, isFeatured) {
    try {
      await API.patch(`/admin/properties/${id}/`, { is_featured: isFeatured });
      API.showToast(`Listing featured flag updated`);
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async deleteProperty(id) {
    if (!confirm('Are you sure you want to remove this listing as an administrator?')) return;
    try {
      await API.delete(`/admin/properties/${id}/`);
      API.showToast('Listing removed by moderator');
      const row = document.getElementById(`admin-prop-${id}`);
      if (row) row.remove();
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async loadReportsTab(container) {
    container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>';
    try {
      const reports = await API.get('/admin/reports/');

      if (reports.length === 0) {
        container.innerHTML = `
          <div class="empty-state bg-white border rounded-3 p-5 text-center">
            <i class="bi bi-check2-circle text-success fs-1 mb-2"></i>
            <h5 class="fw-bold">No Pending Reports</h5>
            <p class="text-muted">The marketplace moderation queue is completely clean.</p>
          </div>
        `;
        return;
      }

      const rows = reports.map(r => `
        <tr>
          <td>#${r.id}</td>
          <td>
            <span class="badge bg-warning text-dark">${r.reason}</span>
          </td>
          <td>
            <div class="small fw-bold">${r.property_data ? r.property_data.title : (r.reported_user_data ? r.reported_user_data.username : 'General')}</div>
            <div class="text-muted small">${r.description}</div>
          </td>
          <td class="small">
            ${r.reporter ? r.reporter.username : 'Anonymous'}
          </td>
          <td>
            <select class="form-select form-select-sm" style="width: 140px;" onchange="Admin.changeReportStatus(${r.id}, this.value)">
              <option value="pending" ${r.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="investigating" ${r.status === 'investigating' ? 'selected' : ''}>Investigating</option>
              <option value="resolved" ${r.status === 'resolved' ? 'selected' : ''}>Resolved</option>
              <option value="dismissed" ${r.status === 'dismissed' ? 'selected' : ''}>Dismissed</option>
            </select>
          </td>
        </tr>
      `).join('');

      container.innerHTML = `
        <div class="card border rounded-3 shadow-sm bg-white overflow-hidden">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Reason</th>
                  <th>Target & Complaint</th>
                  <th>Reporter</th>
                  <th>Resolution</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  },

  async changeReportStatus(reportId, newStatus) {
    try {
      await API.patch(`/admin/reports/${reportId}/`, { status: newStatus });
      API.showToast(`Report status updated to ${newStatus}`);
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  }
};

window.Admin = Admin;
