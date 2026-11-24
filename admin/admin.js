/**
 * SM BRAND — Administrative Dashboard Client
 * Pure Vanilla JavaScript ES6 (Same-Origin SPA)
 */
(function () {
  'use strict';

  // 1. Security & Formatting Utilities
  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeUrl(u) {
    if (!u || typeof u !== 'string') return '';
    var s = u.trim();
    if (/^https:\/\//i.test(s)) return s;
    if (/^\/(?!\/)/.test(s)) return s;
    if (/^assets\/[a-zA-Z0-9_\-\.\/]+$/i.test(s)) return s;
    return '';
  }

  function formatDate(isoStr) {
    if (!isoStr) return '—';
    try {
      var d = new Date(isoStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return esc(isoStr);
    }
  }

  // 2. Central API Client (Cookie Auth, 401 redirect, 422 parser)
  function api(endpoint, options) {
    options = options || {};
    options.credentials = 'same-origin';
    options.headers = options.headers || {};

    if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    return fetch(endpoint, options).then(function (res) {
      if (res.status === 401) {
        window.location.replace('/admin/login.html');
        throw new Error('Authentication required.');
      }

      return res.json().then(function (data) {
        if (!res.ok) {
          var err = new Error((data && data.error && data.error.message) || 'Request failed with status ' + res.status);
          err.status = res.status;
          err.code = data && data.error && data.error.code;
          err.details = data && data.error && data.error.details;
          throw err;
        }
        return data;
      });
    });
  }

  // 3. Toast Notifications
  function toast(message, type) {
    type = type || 'success';
    var container = document.getElementById('toastContainer');
    if (!container) return;

    var el = document.createElement('div');
    el.className = 'toast ' + type;
    var icon = type === 'success'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><polyline points="20 6 9 17 4 12"/></svg>'
      : (type === 'error'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>');

    el.innerHTML = icon + '<span>' + esc(message) + '</span>';
    container.appendChild(el);

    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      el.style.transition = 'all 0.25s ease';
      setTimeout(function () { el.remove(); }, 250);
    }, 3500);
  }

  // 4. Modal System
  var activeModal = null;
  function closeModal() {
    if (activeModal) {
      activeModal.remove();
      activeModal = null;
    }
  }

  function modal(title, bodyHtml, footerHtml, onOpen) {
    closeModal();
    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML =
      '<div class="modal-dialog">' +
        '<div class="modal-header">' +
          '<h3 class="modal-title">' + esc(title) + '</h3>' +
          '<button class="modal-close" aria-label="Close dialog" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="modal-body">' + bodyHtml + '</div>' +
        (footerHtml ? '<div class="modal-footer">' + footerHtml + '</div>' : '') +
      '</div>';

    document.body.appendChild(backdrop);
    activeModal = backdrop;

    backdrop.querySelector('.modal-close').addEventListener('click', closeModal);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeModal();
    });

    if (typeof onOpen === 'function') onOpen(backdrop);
    if (window.lucide) lucide.createIcons();
    return backdrop;
  }

  function confirmModal(title, msg, onConfirm, confirmText, dangerText) {
    var footer =
      '<button class="btn btn-ghost btn-sm" type="button" id="confirmCancel">Cancel</button>' +
      (dangerText ? '<button class="btn btn-ghost btn-sm" type="button" id="confirmDanger" style="color:var(--amber)">' + esc(dangerText) + '</button>' : '') +
      '<button class="btn btn-primary btn-sm" type="button" id="confirmOk" style="background:#ef4444;color:#fff;border-color:#ef4444">' + esc(confirmText || 'Confirm Delete') + '</button>';

    var m = modal(title, '<p style="color:var(--text);font-size:14.5px;line-height:1.6">' + esc(msg) + '</p>', footer);
    m.querySelector('#confirmCancel').addEventListener('click', closeModal);
    m.querySelector('#confirmOk').addEventListener('click', function () {
      closeModal();
      onConfirm('delete');
    });
    if (dangerText && m.querySelector('#confirmDanger')) {
      m.querySelector('#confirmDanger').addEventListener('click', function () {
        closeModal();
        onConfirm('hide');
      });
    }
  }

  // 5. Screen Controllers Object
  window.AdminApp = {
    esc: esc,
    safeUrl: safeUrl,
    formatDate: formatDate,
    api: api,
    toast: toast,
    modal: modal,
    closeModal: closeModal,
    confirmModal: confirmModal,
    screens: {}
  };

  // --- SCREEN 2: Dashboard Overview Controller ---
  AdminApp.screens.overview = function (container) {
    container.innerHTML =
      '<div class="screen-header">' +
        '<div>' +
          '<h1 class="screen-title">Dashboard Overview</h1>' +
          '<div class="screen-subtitle">Live system coordinates, leads pipeline &amp; catalog metrics</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px">' +
          '<a class="btn btn-ghost btn-sm" href="/admin/#products">+ Add Product</a>' +
          '<a class="btn btn-primary btn-sm" href="/admin/#leads">View Inquiries</a>' +
        '</div>' +
      '</div>' +
      '<div class="kpi-grid" id="kpiGrid">' +
        '<div class="kpi-card"><div class="skeleton-row"></div></div>' +
        '<div class="kpi-card"><div class="skeleton-row"></div></div>' +
        '<div class="kpi-card"><div class="skeleton-row"></div></div>' +
        '<div class="kpi-card"><div class="skeleton-row"></div></div>' +
      '</div>' +
      '<div class="admin-card">' +
        '<div class="admin-card-header">' +
          '<h3 class="admin-card-title">Recent Inquiries (Live Feed)</h3>' +
          '<a class="btn btn-ghost btn-sm" href="/admin/#leads">All Leads &rarr;</a>' +
        '</div>' +
        '<div class="table-responsive" id="recentLeadsBox">' +
          '<div style="padding:24px"><div class="skeleton-row"></div><div class="skeleton-row"></div></div>' +
        '</div>' +
      '</div>';

    Promise.all([
      api('/api/admin/leads?limit=5'),
      api('/api/admin/leads?status=new'),
      api('/api/admin/products'),
      api('/api/admin/spares')
    ])
      .then(function (results) {
        var recentLeads = results[0]?.data?.items || [];
        var totalLeads = results[0]?.data?.total || 0;
        var newLeadsCount = results[1]?.data?.total || 0;
        var allProducts = results[2]?.data || [];
        var allSpares = results[3]?.data || [];

        var activeProducts = allProducts.filter(function (p) { return p.is_active !== false; }).length;
        var inStockSpares = allSpares.filter(function (s) { return s.is_active !== false && s.status_badge === 'in_stock'; }).length;

        // Render KPI Cards
        var kpiHtml =
          '<div class="kpi-card">' +
            '<div class="kpi-top">' +
              '<span class="kpi-label">New Inquiries</span>' +
              '<div class="kpi-icon"><i data-lucide="bell"></i></div>' +
            '</div>' +
            '<div class="kpi-value" style="color:var(--green)">' + esc(newLeadsCount) + '</div>' +
            '<div class="kpi-footer"><span class="status-pill new" style="padding:2px 8px;font-size:11px">Awaiting Response</span></div>' +
          '</div>' +
          '<div class="kpi-card">' +
            '<div class="kpi-top">' +
              '<span class="kpi-label">Total Leads</span>' +
              '<div class="kpi-icon"><i data-lucide="users"></i></div>' +
            '</div>' +
            '<div class="kpi-value">' + esc(totalLeads) + '</div>' +
            '<div class="kpi-footer">All logged quote requests</div>' +
          '</div>' +
          '<div class="kpi-card">' +
            '<div class="kpi-top">' +
              '<span class="kpi-label">Active Catalog</span>' +
              '<div class="kpi-icon"><i data-lucide="package"></i></div>' +
            '</div>' +
            '<div class="kpi-value">' + esc(activeProducts) + ' <span style="font-size:16px;color:var(--muted)">/ ' + esc(allProducts.length) + '</span></div>' +
            '<div class="kpi-footer">Machines, Rolls &amp; Tools live</div>' +
          '</div>' +
          '<div class="kpi-card">' +
            '<div class="kpi-top">' +
              '<span class="kpi-label">In-Stock Spares</span>' +
              '<div class="kpi-icon"><i data-lucide="tool"></i></div>' +
            '</div>' +
            '<div class="kpi-value">' + esc(inStockSpares) + ' <span style="font-size:16px;color:var(--muted)">/ ' + esc(allSpares.length) + '</span></div>' +
            '<div class="kpi-footer">Ready for same-day dispatch</div>' +
          '</div>';

        document.getElementById('kpiGrid').innerHTML = kpiHtml;

        // Render Recent Leads Table
        var leadsBox = document.getElementById('recentLeadsBox');
        if (!recentLeads.length) {
          leadsBox.innerHTML =
            '<div class="empty-state">' +
              '<i data-lucide="inbox"></i>' +
              '<p>No customer quotation inquiries logged yet.</p>' +
            '</div>';
        } else {
          var tableHtml =
            '<table class="admin-table">' +
              '<thead>' +
                '<tr>' +
                  '<th>Customer / Company</th>' +
                  '<th>City / Area</th>' +
                  '<th>Requirement</th>' +
                  '<th>Date (PKT)</th>' +
                  '<th>Status</th>' +
                  '<th style="text-align:right">1-Click WhatsApp</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' +
                recentLeads.map(function (lead) {
                  var rawWa = String(lead.whatsapp || '').replace(/\D/g, '');
                  if (rawWa.startsWith('03') && rawWa.length === 11) rawWa = '92' + rawWa.substring(1);
                  var waMsg = 'Salam ' + (lead.name || '') + ', SM Brand Packaging se rabta kar rahe hain aapki quote inquiry ke silsilay me.';
                  var waUrl = 'https://wa.me/' + rawWa + '?text=' + encodeURIComponent(waMsg);

                  var pillCls = 'new';
                  if (lead.status === 'contacted' || lead.status === 'quoted') pillCls = 'warning';
                  else if (lead.status === 'closed') pillCls = 'active';
                  else if (lead.status === 'lost') pillCls = 'muted';

                  return '<tr>' +
                    '<td style="font-weight:700;color:var(--text)">' + esc(lead.name) + '</td>' +
                    '<td>' + esc(lead.city) + '</td>' +
                    '<td><span style="font-weight:600">' + esc(lead.need) + '</span></td>' +
                    '<td style="color:var(--muted);font-size:12.5px">' + formatDate(lead.createdAt) + '</td>' +
                    '<td><span class="status-pill ' + pillCls + '"><span class="led"></span> ' + esc(lead.status) + '</span></td>' +
                    '<td style="text-align:right">' +
                      '<a class="btn-wa-reply" href="' + esc(waUrl) + '" target="_blank" rel="noopener">' +
                        '<i data-lucide="message-square" style="width:14px;height:14px"></i> Reply' +
                      '</a>' +
                    '</td>' +
                  '</tr>';
                }).join('') +
              '</tbody>' +
            '</table>';
          leadsBox.innerHTML = tableHtml;
        }

        if (window.lucide) lucide.createIcons();
      })
      .catch(function (err) {
        toast('Failed loading dashboard overview metrics: ' + err.message, 'error');
      });
  };

  // 6. Router & Shell Initialization
  function initRouter() {
    var contentEl = document.getElementById('mainContent');
    var navLinks = document.querySelectorAll('.nav-link');
    var sidebar = document.getElementById('adminSidebar');
    var backdrop = document.getElementById('sidebarBackdrop');

    function route() {
      var hash = window.location.hash || '#overview';
      var screenId = hash.replace('#', '');
      var handler = AdminApp.screens[screenId] || AdminApp.screens.overview;

      navLinks.forEach(function (link) {
        var linkHash = link.getAttribute('href').split('#')[1] || 'overview';
        link.classList.toggle('active', linkHash === screenId);
      });

      // Close mobile drawer if open
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');

      handler(contentEl);
    }

    window.addEventListener('hashchange', route);

    // Mobile Hamburger
    var burger = document.getElementById('hamburgerBtn');
    if (burger && sidebar && backdrop) {
      burger.addEventListener('click', function () {
        sidebar.classList.toggle('open');
        backdrop.classList.toggle('active');
      });
      backdrop.addEventListener('click', function () {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      });
    }

    // Logout
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        api('/api/auth/logout', { method: 'POST' })
          .then(function () {
            window.location.replace('/admin/login.html');
          })
          .catch(function () {
            window.location.replace('/admin/login.html');
          });
      });
    }

    // Check active session & set user name
    api('/api/auth/me')
      .then(function (res) {
        var user = res.data?.user;
        if (user) {
          var nameEl = document.getElementById('adminUserName');
          var emailEl = document.getElementById('adminUserEmail');
          var avatarEl = document.getElementById('adminUserAvatar');
          if (nameEl) nameEl.textContent = user.name || 'Administrator';
          if (emailEl) emailEl.textContent = user.email || '';
          if (avatarEl) avatarEl.textContent = (user.name || 'A').charAt(0).toUpperCase();
        }
        route();
      })
      .catch(function () {
        window.location.replace('/admin/login.html');
      });
  }

  document.addEventListener('DOMContentLoaded', initRouter);
})();
