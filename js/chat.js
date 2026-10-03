/**
 * TerraTrade Marketplace - Real-Time Chat & Messaging Module
 * Integrates with Django Channels WebSockets with REST fallback
 */

const Chat = {
  conversations: [],
  activeConversation: null,
  socket: null,
  pollInterval: null,

  async updateBadge() {
    const badge = document.getElementById('navbar-chat-count');
    if (!badge) return;

    if (!Auth.isAuthenticated()) {
      badge.textContent = '0';
      badge.classList.add('d-none');
      return;
    }

    try {
      const data = await API.get('/chat/conversations/');
      const list = data.results || (Array.isArray(data) ? data : []);
      this.conversations = list;

      const totalUnread = list.reduce((acc, curr) => acc + (curr.unread_count || 0), 0);
      badge.textContent = totalUnread;
      badge.classList.toggle('d-none', totalUnread === 0);
    } catch (e) {
      badge.classList.add('d-none');
    }
  },

  async load(targetConvId = null) {
    const container = document.getElementById('chat-main-container');
    if (!container) return;

    if (!Auth.isAuthenticated()) {
      container.innerHTML = `
        <div class="empty-state bg-white border rounded-3 p-5 my-4">
          <i class="bi bi-chat-left-dots empty-state-icon"></i>
          <h4>Log in to access your Messages</h4>
          <p class="text-muted">Communicate directly with property sellers, ask zoning questions, and negotiate purchase offers.</p>
          <button class="btn btn-primary" onclick="App.showAuthModal('login')">Log In Now</button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Loading conversations...</p>
      </div>
    `;

    try {
      const data = await API.get('/chat/conversations/');
      const list = data.results || (Array.isArray(data) ? data : []);
      this.conversations = list;

      this.renderLayout(container);

      if (targetConvId) {
        this.selectConversation(Number(targetConvId));
      } else if (list.length > 0) {
        this.selectConversation(list[0].id);
      } else {
        this.renderEmptyChat();
      }

      this.updateBadge();
    } catch (err) {
      container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  },

  renderLayout(container) {
    container.innerHTML = `
      <div class="row g-0 chat-container shadow-sm">
        <!-- Left: Conversations List -->
        <div class="col-12 col-md-4 col-lg-4 conversation-list bg-white">
          <div class="p-3 border-bottom d-flex justify-content-between align-items-center">
            <h5 class="fw-bold mb-0">Messages</h5>
            <span class="badge bg-secondary-subtle text-secondary">${this.conversations.length}</span>
          </div>
          <div id="chat-conversation-items" class="list-group list-group-flush">
            ${this.renderConversationListItems()}
          </div>
        </div>

        <!-- Right: Active Chat Area -->
        <div class="col-12 col-md-8 col-lg-8 d-flex flex-column bg-white" id="chat-active-area">
          <div class="text-center my-auto p-5 text-muted">
            <i class="bi bi-chat-square-dots fs-1 d-block mb-2"></i>
            Select a conversation on the left to start messaging.
          </div>
        </div>
      </div>
    `;
  },

  renderConversationListItems() {
    if (this.conversations.length === 0) {
      return `
        <div class="p-4 text-center text-muted small">
          <i class="bi bi-chat-dots d-block fs-3 mb-2"></i>
          No conversations yet. Inquire on a property or wait for buyer inquiries.
        </div>
      `;
    }

    return this.conversations.map(conv => {
      const other = conv.other_participant || {};
      const prop = conv.property;
      const lastMsg = conv.last_message;
      const unreadCount = conv.unread_count || 0;
      const isActive = this.activeConversation?.id === conv.id;

      return `
        <div class="conversation-item ${isActive ? 'active' : ''}" onclick="Chat.selectConversation(${conv.id})">
          <div class="d-flex align-items-center gap-2 mb-1">
            <img src="${other.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(other.full_name || 'User')}&background=1b4332&color=fff`}" 
                 class="rounded-circle" width="40" height="40" alt="Avatar">
            <div class="flex-grow-1 text-truncate">
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold small text-dark">${other.full_name || other.username}</span>
                ${unreadCount > 0 ? `<span class="badge rounded-pill bg-danger">${unreadCount}</span>` : ''}
              </div>
              <div class="text-muted" style="font-size: 0.78rem;">${other.company_name || (other.is_seller ? 'Seller' : 'Buyer')}</div>
            </div>
          </div>

          ${prop ? `
            <div class="bg-light p-1 px-2 rounded small text-truncate text-secondary mb-1" style="font-size: 0.75rem;">
              <i class="bi bi-house-door me-1"></i>${prop.title} ($${Number(prop.price).toLocaleString()})
            </div>
          ` : ''}

          <div class="text-muted text-truncate small">
            ${lastMsg ? lastMsg.content : 'No messages yet'}
          </div>
        </div>
      `;
    }).join('');
  },

  async selectConversation(convId) {
    const conv = this.conversations.find(c => c.id === convId);
    if (!conv) return;

    this.activeConversation = conv;

    // Highlight in list
    const itemsEl = document.getElementById('chat-conversation-items');
    if (itemsEl) {
      itemsEl.innerHTML = this.renderConversationListItems();
    }

    const area = document.getElementById('chat-active-area');
    if (!area) return;

    const other = conv.other_participant || {};
    const prop = conv.property;

    area.innerHTML = `
      <!-- Header -->
      <div class="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
        <div class="d-flex align-items-center gap-2">
          <img src="${other.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(other.full_name || 'User')}&background=1b4332&color=fff`}" 
               class="rounded-circle" width="44" height="44" alt="Avatar">
          <div>
            <h6 class="fw-bold mb-0">${other.full_name || other.username}</h6>
            <span class="text-muted small">${other.company_name ? other.company_name + ' • ' : ''}${other.is_seller ? 'Seller' : 'Buyer'}</span>
          </div>
        </div>

        ${prop ? `
          <div class="d-flex align-items-center gap-2">
            <span id="chat-ws-status-badge" class="badge bg-warning text-dark small">Connecting...</span>
            <a href="#property?id=${prop.id}" class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
              <i class="bi bi-box-arrow-up-right"></i>
              <span class="d-none d-sm-inline">View Property</span>
            </a>
          </div>
        ` : `
          <span id="chat-ws-status-badge" class="badge bg-warning text-dark small">Connecting...</span>
        `}
      </div>

      <!-- Messages Area -->
      <div id="chat-messages-scroll" class="chat-messages-area d-flex flex-column">
        <div class="text-center py-4">
          <div class="spinner-border spinner-border-sm text-primary"></div>
        </div>
      </div>

      <!-- Composer Input -->
      <div class="p-3 border-top bg-white">
        <form onsubmit="Chat.sendMessage(event)" class="d-flex gap-2">
          <input type="text" id="chat-message-input" class="form-control" 
                 placeholder="Type your message to ${other.first_name || other.username}..." 
                 autocomplete="off" required>
          <button type="submit" class="btn btn-primary px-4 d-flex align-items-center gap-1">
            <i class="bi bi-send-fill"></i>
            <span class="d-none d-sm-inline">Send</span>
          </button>
        </form>
      </div>
    `;

    // Connect WebSocket
    this.connectWebSocket(conv.id);

    // Load initial messages via REST
    await this.loadMessages(conv.id);

    // Focus input
    const input = document.getElementById('chat-message-input');
    if (input) input.focus();
  },

  async loadMessages(convId) {
    try {
      const messages = await API.get(`/chat/conversations/${convId}/messages/`);
      this.renderMessages(messages);
      this.scrollToBottom();
      this.updateBadge();
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  },

  renderMessages(messages) {
    const container = document.getElementById('chat-messages-scroll');
    if (!container) return;

    if (!messages || messages.length === 0) {
      container.innerHTML = `
        <div class="text-center text-muted my-auto p-4">
          <i class="bi bi-chat-text fs-2 d-block mb-2"></i>
          Send a greeting or inquire about property documents, permits, and pricing!
        </div>
      `;
      return;
    }

    container.innerHTML = messages.map(msg => this.renderMessageBubble(msg)).join('');
  },

  renderMessageBubble(msg) {
    const isMe = msg.is_me !== undefined ? msg.is_me : (msg.sender_id === Auth.currentUser?.id || msg.sender === Auth.currentUser?.id);
    const time = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return `
      <div class="message-bubble ${isMe ? 'mine' : 'theirs'}" id="msg-${msg.id}">
        <div class="message-content">${this.escapeHtml(msg.content)}</div>
        <div class="message-time text-end">
          ${time} ${isMe ? '<i class="bi bi-check2-all ms-1"></i>' : ''}
        </div>
      </div>
    `;
  },

  connectWebSocket(convId) {
    // Close existing socket
    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {}
      this.socket = null;
    }

    // Stop existing poll
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    const token = API.getToken();
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/chat/${convId}/?token=${token}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log(`WebSocket connected to conversation #${convId}`);
        const badge = document.getElementById('chat-ws-status-badge');
        if (badge) {
          badge.className = 'badge bg-success small';
          badge.innerHTML = '<i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i> Live WebSocket';
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_message') {
            this.appendIncomingMessage(data.message);
          }
        } catch (e) {
          console.warn('Malformed websocket event:', e);
        }
      };

      this.socket.onerror = (err) => {
        console.warn('WebSocket connection error, switching to real REST polling:', err);
        const badge = document.getElementById('chat-ws-status-badge');
        if (badge) {
          badge.className = 'badge bg-secondary small';
          badge.innerHTML = 'REST Mode (Polling)';
        }
        this.startPolling(convId);
      };

      this.socket.onclose = () => {
        const badge = document.getElementById('chat-ws-status-badge');
        if (badge) {
          badge.className = 'badge bg-secondary small';
          badge.innerHTML = 'REST Mode (Polling)';
        }
        this.startPolling(convId);
      };
    } catch (e) {
      this.startPolling(convId);
    }
  },

  startPolling(convId) {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(() => {
      if (this.activeConversation && this.activeConversation.id === convId) {
        this.loadMessages(convId);
      }
    }, 4000);
  },

  appendIncomingMessage(msg) {
    const container = document.getElementById('chat-messages-scroll');
    if (!container) return;

    // Check if already rendered
    if (document.getElementById(`msg-${msg.id}`)) return;

    container.insertAdjacentHTML('beforeend', this.renderMessageBubble(msg));
    this.scrollToBottom();

    // Mark as read in active view
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: 'mark_read' }));
    }
  },

  async sendMessage(event) {
    if (event) event.preventDefault();

    const input = document.getElementById('chat-message-input');
    if (!input || !input.value.trim() || !this.activeConversation) return;

    const content = input.value.trim();
    input.value = '';

    // If WebSocket is open, send via WS
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        action: 'send_message',
        content: content
      }));
    } else {
      // Fallback via REST endpoint
      try {
        const msg = await API.post(`/chat/conversations/${this.activeConversation.id}/messages/`, { content });
        this.appendIncomingMessage(msg);
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    }
  },

  scrollToBottom() {
    const container = document.getElementById('chat-messages-scroll');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  },

  renderEmptyChat() {
    const area = document.getElementById('chat-active-area');
    if (area) {
      area.innerHTML = `
        <div class="text-center my-auto p-5 text-muted">
          <i class="bi bi-chat-left-text fs-1 d-block mb-3 text-secondary"></i>
          <h5 class="fw-bold text-dark">No Active Inquiries</h5>
          <p class="text-muted">Start a conversation directly from any property page using "Contact Seller", or submit multiple inquiries from your Consideration Cart.</p>
          <a href="#discover" class="btn btn-primary mt-2">Explore Properties</a>
        </div>
      `;
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

window.Chat = Chat;
