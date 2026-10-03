/**
 * TerraTrade Marketplace - Authentication & User State
 */

const Auth = {
  currentUser: null,

  async init() {
    const token = API.getToken();
    if (token) {
      try {
        const user = await API.get('/accounts/profile/');
        this.currentUser = user || null;
      } catch (err) {
        API.setToken(null);
        this.currentUser = null;
      }
    } else {
      this.currentUser = null;
    }
    this.updateUI();
  },

  isAuthenticated() {
    return !!this.currentUser;
  },

  isSeller() {
    return this.currentUser?.is_seller === true;
  },

  isAdmin() {
    return this.currentUser?.is_staff === true || this.currentUser?.is_superuser === true;
  },

  async login(username, password) {
    try {
      const data = await API.post('/accounts/login/', { username, password });
      API.setToken(data.token);
      this.currentUser = data.user;
      this.updateUI();
      API.showToast(`Welcome back, ${this.currentUser.full_name || this.currentUser.username}!`);
      window.dispatchEvent(new CustomEvent('terratrade:auth-change'));
      return data;
    } catch (err) {
      API.showToast(err.message, 'error');
      throw err;
    }
  },

  async demoLogin(role) {
    const credentials = {
      buyer: { username: 'alex_buyer', password: 'buyer123' },
      seller_farmland: { username: 'sarah_land', password: 'seller123' },
      seller_commercial: { username: 'david_realty', password: 'seller123' },
      admin: { username: 'admin', password: 'admin123' },
    };

    const cred = credentials[role];
    if (!cred) return;
    return this.login(cred.username, cred.password);
  },

  async register(formData) {
    try {
      const data = await API.post('/accounts/register/', formData);
      API.setToken(data.token);
      this.currentUser = data.user;
      this.updateUI();
      API.showToast('Account created successfully!');
      window.dispatchEvent(new CustomEvent('terratrade:auth-change'));
      return data;
    } catch (err) {
      API.showToast(err.message, 'error');
      throw err;
    }
  },

  async logout() {
    try {
      await API.post('/accounts/logout/').catch(() => {});
    } finally {
      API.setToken(null);
      this.currentUser = null;
      this.updateUI();
      API.showToast('You have been logged out.');
      window.dispatchEvent(new CustomEvent('terratrade:auth-change'));
      window.location.hash = '#home';
    }
  },

  async updateProfile(profileData) {
    try {
      const res = await API.put('/accounts/profile/', profileData);
      this.currentUser = res.user;
      this.updateUI();
      API.showToast('Profile updated successfully!');
      return res.user;
    } catch (err) {
      API.showToast(err.message, 'error');
      throw err;
    }
  },

  updateUI() {
    const authLoggedOutEls = document.querySelectorAll('.auth-logged-out');
    const authLoggedInEls = document.querySelectorAll('.auth-logged-in');
    const authSellerEls = document.querySelectorAll('.auth-seller-only');
    const authAdminEls = document.querySelectorAll('.auth-admin-only');
    const userNameEl = document.getElementById('navbar-user-name');
    const userRoleEl = document.getElementById('navbar-user-role');
    const userAvatarEl = document.getElementById('navbar-user-avatar');

    if (this.isAuthenticated()) {
      authLoggedOutEls.forEach(el => el.classList.add('d-none'));
      authLoggedInEls.forEach(el => el.classList.remove('d-none'));

      if (userNameEl) {
        userNameEl.textContent = this.currentUser.full_name || this.currentUser.username;
      }
      if (userRoleEl) {
        const roleName = this.isAdmin() ? 'Administrator' : this.isSeller() ? 'Seller & Buyer' : 'Buyer';
        userRoleEl.textContent = roleName;
      }
      if (userAvatarEl) {
        userAvatarEl.src = this.currentUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.username)}&background=1b4332&color=fff`;
      }

      // Seller links
      authSellerEls.forEach(el => {
        el.classList.toggle('d-none', !this.isSeller());
      });

      // Admin links
      authAdminEls.forEach(el => {
        el.classList.toggle('d-none', !this.isAdmin());
      });
    } else {
      authLoggedOutEls.forEach(el => el.classList.remove('d-none'));
      authLoggedInEls.forEach(el => el.classList.add('d-none'));
      authSellerEls.forEach(el => el.classList.add('d-none'));
      authAdminEls.forEach(el => el.classList.add('d-none'));
    }
  }
};

window.Auth = Auth;
