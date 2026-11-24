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

  // --- SCREEN 3: Product Management Controller ---
  var CATEGORY_TAG_MAP = {
    machines: ['semi', 'auto', 'high'],
    rolls: ['pp', 'pet', 'acc'],
    battery: ['battery'],
    hand: ['hand']
  };

  AdminApp.screens.products = function (container) {
    container.innerHTML =
      '<div class="screen-header">' +
        '<div>' +
          '<h1 class="screen-title">Product Catalog</h1>' +
          '<div class="screen-subtitle">Manage strapping machines, packaging rolls, and handheld tools</div>' +
        '</div>' +
        '<button class="btn btn-primary btn-sm" id="addProductBtn" type="button">' +
          '<i data-lucide="plus" style="width:16px;height:16px"></i> Add Product' +
        '</button>' +
      '</div>' +
      '<div class="admin-card">' +
        '<div class="admin-card-header">' +
          '<div class="toolbar">' +
            '<div class="search-box">' +
              '<i data-lucide="search"></i>' +
              '<input type="text" id="productSearch" placeholder="Search products by name or slug...">' +
            '</div>' +
            '<select class="filter-select" id="productCategoryFilter">' +
              '<option value="all">All Categories</option>' +
              '<option value="machines">Machines</option>' +
              '<option value="rolls">Strapping Rolls</option>' +
              '<option value="battery">Battery Tools</option>' +
              '<option value="hand">Manual Hand Tools</option>' +
            '</select>' +
          '</div>' +
          '<div style="font-size:13px;color:var(--muted)" id="productCountBadge">Loading...</div>' +
        '</div>' +
        '<div class="table-responsive" id="productsTableBox">' +
          '<div style="padding:24px"><div class="skeleton-row"></div><div class="skeleton-row"></div><div class="skeleton-row"></div></div>' +
        '</div>' +
      '</div>';

    var allProducts = [];
    var searchInput = document.getElementById('productSearch');
    var catFilter = document.getElementById('productCategoryFilter');
    var countBadge = document.getElementById('productCountBadge');
    var tableBox = document.getElementById('productsTableBox');

    function renderTable() {
      var q = (searchInput.value || '').trim().toLowerCase();
      var cat = catFilter.value;

      var filtered = allProducts.filter(function (p) {
        var matchCat = cat === 'all' || p.category === cat;
        var matchQ = !q || (p.name && p.name.toLowerCase().indexOf(q) !== -1) || (p.slug && p.slug.toLowerCase().indexOf(q) !== -1);
        return matchCat && matchQ;
      });

      countBadge.textContent = 'Showing ' + filtered.length + ' of ' + allProducts.length + ' products';

      if (!filtered.length) {
        tableBox.innerHTML =
          '<div class="empty-state">' +
            '<i data-lucide="package-search"></i>' +
            '<p>No products found matching your filter criteria.</p>' +
          '</div>';
        if (window.lucide) lucide.createIcons();
        return;
      }

      var html =
        '<table class="admin-table">' +
          '<thead>' +
            '<tr>' +
              '<th style="width:56px">Item</th>' +
              '<th>Name &amp; Slug</th>' +
              '<th>Category &amp; Tag</th>' +
              '<th>Price Display</th>' +
              '<th>Compare</th>' +
              '<th>Status</th>' +
              '<th style="text-align:right">Actions</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            filtered.map(function (p) {
              var thumb = safeUrl(p.img) || '/assets/img/rolls.jpg';
              var isActive = p.is_active !== false;
              var isCompared = p.is_compared === true;

              return '<tr data-id="' + esc(p._id) + '">' +
                '<td>' +
                  '<img src="' + esc(thumb) + '" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:6px;background:var(--panel-3)" onerror="this.src=\'data:image/svg+xml;utf8,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\' width=\\\'44\\\' height=\\\'44\\\' fill=\\\'%2326262a\\\'><rect width=\\\'44\\\' height=\\\'44\\\'/></svg>\'">' +
                '</td>' +
                '<td>' +
                  '<div style="font-weight:700;color:var(--text)">' + esc(p.name) + '</div>' +
                  '<div style="font-size:12px;color:var(--muted-2);font-family:monospace">' + esc(p.slug) + '</div>' +
                '</td>' +
                '<td>' +
                  '<span style="font-weight:600;text-transform:capitalize">' + esc(p.category) + '</span>' +
                  '<span style="color:var(--muted-2)"> / ' + esc(p.tag) + '</span>' +
                '</td>' +
                '<td>' +
                  '<b>' + esc(p.price_label || 'On Inquiry') + '</b>' +
                  (p.badge ? ' <span class="status-pill warning" style="padding:1px 6px;font-size:10.5px">' + esc(p.badge) + '</span>' : '') +
                '</td>' +
                '<td>' +
                  (isCompared
                    ? '<span class="status-pill active" style="font-size:11px"><span class="led"></span> Yes (' + esc(p.compare_order || 0) + ')</span>'
                    : '<span style="color:var(--muted-2);font-size:12px">—</span>') +
                '</td>' +
                '<td>' +
                  '<button class="status-pill ' + (isActive ? 'active' : 'muted') + ' toggle-active-btn" type="button" style="cursor:pointer" title="Click to toggle visibility">' +
                    '<span class="led"></span> ' + (isActive ? 'Active' : 'Hidden') +
                  '</button>' +
                '</td>' +
                '<td style="text-align:right;white-space:nowrap">' +
                  '<button class="btn btn-ghost btn-sm edit-btn" type="button" style="padding:5px 10px;margin-right:6px">Edit</button>' +
                  '<button class="btn btn-ghost btn-sm delete-btn" type="button" style="padding:5px 10px;color:#f87171">Delete</button>' +
                '</td>' +
              '</tr>';
            }).join('') +
          '</tbody>' +
        '</table>';

      tableBox.innerHTML = html;
      if (window.lucide) lucide.createIcons();

      // Bind Row Actions
      tableBox.querySelectorAll('.toggle-active-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var tr = btn.closest('tr');
          var id = tr.getAttribute('data-id');
          var prod = allProducts.find(function (x) { return x._id === id; });
          if (!prod) return;

          var nextActive = prod.is_active === false;
          btn.disabled = true;

          api('/api/admin/products/' + id, {
            method: 'PUT',
            body: { is_active: nextActive }
          })
            .then(function (res) {
              prod.is_active = res.data.is_active;
              toast(prod.name + (nextActive ? ' published to site.' : ' hidden from public site.'));
              renderTable();
            })
            .catch(function (err) {
              btn.disabled = false;
              toast('Failed updating status: ' + err.message, 'error');
            });
        });
      });

      tableBox.querySelectorAll('.edit-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.closest('tr').getAttribute('data-id');
          var prod = allProducts.find(function (x) { return x._id === id; });
          if (prod) openProductModal(prod);
        });
      });

      tableBox.querySelectorAll('.delete-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.closest('tr').getAttribute('data-id');
          var prod = allProducts.find(function (x) { return x._id === id; });
          if (!prod) return;

          confirmModal(
            'Delete Product',
            'Are you sure you want to permanently delete "' + prod.name + '"? This action cannot be undone. To remove it from public view without deleting, you can hide it instead.',
            function (choice) {
              if (choice === 'hide') {
                api('/api/admin/products/' + id, {
                  method: 'PUT',
                  body: { is_active: false }
                })
                  .then(function () {
                    prod.is_active = false;
                    toast(prod.name + ' hidden from catalog.');
                    renderTable();
                  })
                  .catch(function (err) { toast('Error: ' + err.message, 'error'); });
              } else if (choice === 'delete') {
                api('/api/admin/products/' + id, { method: 'DELETE' })
                  .then(function () {
                    allProducts = allProducts.filter(function (x) { return x._id !== id; });
                    toast(prod.name + ' deleted permanently.');
                    renderTable();
                  })
                  .catch(function (err) { toast('Delete failed: ' + err.message, 'error'); });
              }
            },
            'Delete Permanently',
            'Hide Product Instead'
          );
        });
      });
    }

    function loadProducts() {
      api('/api/admin/products')
        .then(function (res) {
          allProducts = res.data || [];
          renderTable();
        })
        .catch(function (err) {
          tableBox.innerHTML = '<div style="padding:24px;color:#f87171">Failed loading products: ' + esc(err.message) + '</div>';
        });
    }

    searchInput.addEventListener('input', renderTable);
    catFilter.addEventListener('change', renderTable);
    document.getElementById('addProductBtn').addEventListener('click', function () {
      openProductModal(null);
    });

    loadProducts();

    // Product Modal Editor Function
    function openProductModal(item) {
      var isEdit = Boolean(item);
      var category = item ? item.category : 'machines';
      var allowedTags = CATEGORY_TAG_MAP[category] || ['semi'];
      var tag = item ? item.tag : allowedTags[0];
      var specs = (item && Array.isArray(item.specs)) ? item.specs : [
        ['Speed', '24 straps / min'],
        ['Strap', 'PP 9–15mm'],
        ['Power', '220V']
      ];

      var formHtml =
        '<form id="productModalForm" novalidate>' +
          '<div class="form-grid">' +
            '<div class="form-field">' +
              '<label for="m_category">Category *</label>' +
              '<select id="m_category" required>' +
                '<option value="machines"' + (category === 'machines' ? ' selected' : '') + '>Machines</option>' +
                '<option value="rolls"' + (category === 'rolls' ? ' selected' : '') + '>Strapping Rolls</option>' +
                '<option value="battery"' + (category === 'battery' ? ' selected' : '') + '>Battery Tools</option>' +
                '<option value="hand"' + (category === 'hand' ? ' selected' : '') + '>Manual Hand Tools</option>' +
              '</select>' +
            '</div>' +
            '<div class="form-field">' +
              '<label for="m_tag">Filter Tag *</label>' +
              '<select id="m_tag" required></select>' +
            '</div>' +
            '<div class="form-field full">' +
              '<label for="m_name">Product Name *</label>' +
              '<input type="text" id="m_name" value="' + esc(item ? item.name : '') + '" placeholder="e.g. SM-601 Pro Semi-Auto" required>' +
              '<div class="field-error" id="err_name"></div>' +
            '</div>' +
            '<div class="form-field">' +
              '<label for="m_slug">URL Slug * ' + (isEdit ? '<span style="color:var(--amber);font-size:11px">(Immutable)</span>' : '') + '</label>' +
              '<input type="text" id="m_slug" value="' + esc(item ? item.slug : '') + '" placeholder="sm-601-pro" ' + (isEdit ? 'disabled' : 'required') + '>' +
              '<div class="field-hint">' + (isEdit ? 'Slug cannot be modified after product creation.' : 'Lowercase kebab-case e.g. sm-601-pro') + '</div>' +
              '<div class="field-error" id="err_slug"></div>' +
            '</div>' +
            '<div class="form-field">' +
              '<label for="m_price_label">Price Label *</label>' +
              '<input type="text" id="m_price_label" value="' + esc(item ? item.price_label : 'Rs 285,000') + '" placeholder="Rs 285,000" required>' +
              '<div class="field-error" id="err_price_label"></div>' +
            '</div>' +
            '<div class="form-field">' +
              '<label for="m_price_numeric">Price Numeric (Optional)</label>' +
              '<input type="number" id="m_price_numeric" value="' + esc(item && item.price_numeric !== undefined ? item.price_numeric : '') + '" placeholder="285000">' +
            '</div>' +
            '<div class="form-field">' +
              '<label for="m_badge">Badge Highlight</label>' +
              '<input type="text" id="m_badge" value="' + esc(item ? item.badge : '') + '" placeholder="e.g. Best Seller, Starter, Export">' +
            '</div>' +
            '<div class="form-field full">' +
              '<label for="m_spec">Summary Specification Line *</label>' +
              '<input type="text" id="m_spec" value="' + esc(item ? item.spec : '') + '" placeholder="24/min • PP 9-15mm • 220V" maxlength="160" required>' +
              '<div class="field-error" id="err_spec"></div>' +
            '</div>' +
            '<div class="form-field full">' +
              '<label for="m_description">Promotional &amp; Technical Description *</label>' +
              '<textarea id="m_description" rows="3" placeholder="Full paragraph description..." required>' + esc(item ? item.description : '') + '</textarea>' +
              '<div class="field-error" id="err_description"></div>' +
            '</div>' +

            // Image Upload & Dropzone
            '<div class="form-field full">' +
              '<label>Product Photography *</label>' +
              '<div class="dropzone" id="imgDropzone">' +
                '<input type="file" id="imgFileInput" accept="image/jpeg,image/png,image/webp" style="display:none">' +
                '<i data-lucide="upload-cloud" style="width:32px;height:32px;color:var(--muted);margin-bottom:8px"></i>' +
                '<div style="font-weight:700;font-size:13.5px">Drop image file here, or <span style="text-decoration:underline">browse</span></div>' +
                '<div style="font-size:12px;color:var(--muted-2);margin-top:4px">JPEG, PNG, or WebP up to 8 MB</div>' +
              '</div>' +
              '<div class="dropzone-preview" id="imgPreviewBox" style="' + (item && item.img ? '' : 'display:none') + '">' +
                '<img id="imgPreviewEl" src="' + esc(item && item.img ? safeUrl(item.img) : '') + '" alt="Preview">' +
                '<div style="flex:1;min-width:0">' +
                  '<input type="text" id="m_img" value="' + esc(item ? item.img : '') + '" placeholder="https://..." style="width:100%;font-size:12.5px" required>' +
                  '<div style="font-size:11px;color:var(--muted-2);margin-top:2px">Direct Cloudinary or HTTPS Image URL</div>' +
                '</div>' +
              '</div>' +
              '<div class="field-error" id="err_img"></div>' +
            '</div>' +

            // Technical Specs Repeater
            '<div class="form-field full">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
                '<label style="margin:0">Technical Specifications (Key / Value Pairs)</label>' +
                '<button class="btn btn-ghost btn-sm" id="addSpecRowBtn" type="button" style="padding:4px 10px;font-size:12px">+ Add Row</button>' +
              '</div>' +
              '<div id="specsContainer"></div>' +
            '</div>' +

            // Options: is_active, is_compared, compare_order, sort_order
            '<div class="form-field">' +
              '<label style="display:flex;align-items:center;gap:8px;text-transform:none;cursor:pointer">' +
                '<input type="checkbox" id="m_is_active"' + (item ? (item.is_active !== false ? ' checked' : '') : ' checked') + ' style="width:16px;height:16px">' +
                '<span><b>Publish Active</b> (Visible on public catalog)</span>' +
              '</label>' +
            '</div>' +
            '<div class="form-field">' +
              '<label style="display:flex;align-items:center;gap:8px;text-transform:none;cursor:pointer">' +
                '<input type="checkbox" id="m_is_compared"' + (item && item.is_compared ? ' checked' : '') + ' style="width:16px;height:16px">' +
                '<span><b>Compare Matrix</b> (Include in compare table)</span>' +
              '</label>' +
            '</div>' +
            '<div class="form-field">' +
              '<label for="m_compare_order">Compare Order</label>' +
              '<input type="number" id="m_compare_order" value="' + esc(item ? item.compare_order || 0 : 0) + '">' +
            '</div>' +
            '<div class="form-field">' +
              '<label for="m_sort_order">Catalog Sort Order</label>' +
              '<input type="number" id="m_sort_order" value="' + esc(item ? item.sort_order || 0 : 0) + '">' +
            '</div>' +
          '</div>' +
        '</form>';

      var footerHtml =
        '<button class="btn btn-ghost btn-sm" id="modalCancelBtn" type="button">Cancel</button>' +
        '<button class="btn btn-primary btn-sm" id="modalSaveBtn" type="button">' +
          '<span>' + (isEdit ? 'Save Changes' : 'Create Product') + '</span>' +
        '</button>';

      var dlg = modal(isEdit ? 'Edit Product: ' + item.name : 'Add New Product', formHtml, footerHtml, function (root) {
        var catSelect = root.querySelector('#m_category');
        var tagSelect = root.querySelector('#m_tag');
        var nameInput = root.querySelector('#m_name');
        var slugInput = root.querySelector('#m_slug');
        var specsBox = root.querySelector('#specsContainer');
        var dropzone = root.querySelector('#imgDropzone');
        var fileInput = root.querySelector('#imgFileInput');
        var previewBox = root.querySelector('#imgPreviewBox');
        var previewImg = root.querySelector('#imgPreviewEl');
        var imgUrlInput = root.querySelector('#m_img');

        function updateTags() {
          var c = catSelect.value;
          var tags = CATEGORY_TAG_MAP[c] || ['semi'];
          tagSelect.innerHTML = tags.map(function (t) {
            return '<option value="' + esc(t) + '"' + (t === tag ? ' selected' : '') + '>' + esc(t) + '</option>';
          }).join('');
        }
        catSelect.addEventListener('change', function () {
          tag = (CATEGORY_TAG_MAP[catSelect.value] || [])[0];
          updateTags();
        });
        updateTags();

        // Auto-generate slug on typing if creating new product
        if (!isEdit) {
          nameInput.addEventListener('input', function () {
            slugInput.value = nameInput.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          });
        }

        // Specs Repeater
        function renderSpecs(list) {
          specsBox.innerHTML = list.map(function (s, idx) {
            return '<div class="repeater-row" data-idx="' + idx + '">' +
              '<input type="text" class="spec-k" value="' + esc(s[0]) + '" placeholder="Key (e.g. Speed)" style="flex:1">' +
              '<input type="text" class="spec-v" value="' + esc(s[1]) + '" placeholder="Value (e.g. 24/min)" style="flex:2">' +
              '<button class="btn-icon danger del-spec-btn" type="button" title="Remove row">&times;</button>' +
            '</div>';
          }).join('');

          specsBox.querySelectorAll('.del-spec-btn').forEach(function (b) {
            b.addEventListener('click', function () {
              var row = b.closest('.repeater-row');
              var idx = parseInt(row.getAttribute('data-idx'), 10);
              specs.splice(idx, 1);
              renderSpecs(specs);
            });
          });
        }
        renderSpecs(specs);

        root.querySelector('#addSpecRowBtn').addEventListener('click', function () {
          specs.push(['', '']);
          renderSpecs(specs);
        });

        // Image upload handling
        dropzone.addEventListener('click', function () { fileInput.click(); });
        dropzone.addEventListener('dragover', function (e) {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', function () {
          dropzone.classList.remove('dragover');
        });
        dropzone.addEventListener('drop', function (e) {
          e.preventDefault();
          dropzone.classList.remove('dragover');
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        });
        fileInput.addEventListener('change', function () {
          if (fileInput.files && fileInput.files[0]) {
            handleFileUpload(fileInput.files[0]);
          }
        });

        function handleFileUpload(file) {
          if (!file) return;
          if (file.size > 8 * 1024 * 1024) {
            toast('File exceeds 8 MB size limit.', 'error');
            return;
          }

          var formData = new FormData();
          formData.append('image', file);

          var origText = dropzone.querySelector('div').textContent;
          dropzone.querySelector('div').textContent = 'Uploading to Cloudinary...';

          api('/api/admin/media/upload', {
            method: 'POST',
            body: formData
          })
            .then(function (res) {
              dropzone.querySelector('div').textContent = origText;
              if (res.data && res.data.url) {
                imgUrlInput.value = res.data.url;
                previewImg.src = safeUrl(res.data.url);
                previewBox.style.display = 'flex';
                toast('Image uploaded successfully.');
              }
            })
            .catch(function (err) {
              dropzone.querySelector('div').textContent = origText;
              toast('Image upload failed: ' + err.message, 'error');
            });
        }

        imgUrlInput.addEventListener('input', function () {
          var val = safeUrl(imgUrlInput.value);
          if (val) {
            previewImg.src = val;
            previewBox.style.display = 'flex';
          }
        });

        root.querySelector('#modalCancelBtn').addEventListener('click', closeModal);
        root.querySelector('#modalSaveBtn').addEventListener('click', function () {
          saveProduct(item, root);
        });
      });
    }

    function saveProduct(existing, root) {
      // Clear previous field errors
      root.querySelectorAll('.field-error').forEach(function (e) { e.textContent = ''; e.style.display = 'none'; });
      root.querySelectorAll('.form-field').forEach(function (f) { f.classList.remove('has-error'); });

      var name = root.querySelector('#m_name').value.trim();
      var slug = root.querySelector('#m_slug').value.trim();
      var category = root.querySelector('#m_category').value;
      var tag = root.querySelector('#m_tag').value;
      var price_label = root.querySelector('#m_price_label').value.trim();
      var price_numeric = parseFloat(root.querySelector('#m_price_numeric').value);
      var badge = root.querySelector('#m_badge').value.trim();
      var spec = root.querySelector('#m_spec').value.trim();
      var description = root.querySelector('#m_description').value.trim();
      var img = root.querySelector('#m_img').value.trim();
      var is_active = root.querySelector('#m_is_active').checked;
      var is_compared = root.querySelector('#m_is_compared').checked;
      var compare_order = parseInt(root.querySelector('#m_compare_order').value, 10) || 0;
      var sort_order = parseInt(root.querySelector('#m_sort_order').value, 10) || 0;

      // Extract specs rows
      var currentSpecs = [];
      root.querySelectorAll('.repeater-row').forEach(function (r) {
        var k = r.querySelector('.spec-k').value.trim();
        var v = r.querySelector('.spec-v').value.trim();
        if (k || v) currentSpecs.push([k, v]);
      });

      var payload = {
        name: name,
        category: category,
        tag: tag,
        price_label: price_label,
        spec: spec,
        description: description,
        img: img,
        badge: badge,
        specs: currentSpecs,
        is_active: is_active,
        is_compared: is_compared,
        compare_order: compare_order,
        sort_order: sort_order
      };

      if (!isNaN(price_numeric)) payload.price_numeric = price_numeric;
      if (!existing) payload.slug = slug;

      var saveBtn = root.querySelector('#modalSaveBtn');
      saveBtn.disabled = true;

      var endpoint = existing ? '/api/admin/products/' + existing._id : '/api/admin/products';
      var method = existing ? 'PUT' : 'POST';

      api(endpoint, {
        method: method,
        body: payload
      })
        .then(function (res) {
          closeModal();
          toast(res.data.name + (existing ? ' updated successfully.' : ' created successfully.'));
          loadProducts();
        })
        .catch(function (err) {
          saveBtn.disabled = false;
          if (err.details && Array.isArray(err.details)) {
            err.details.forEach(function (d) {
              var fieldBox = root.querySelector('#err_' + d.field);
              if (fieldBox) {
                fieldBox.textContent = d.issue || d.message;
                fieldBox.style.display = 'block';
                fieldBox.closest('.form-field')?.classList.add('has-error');
              }
            });
            toast('Please correct the validation errors in the form.', 'error');
          } else {
            toast(err.message || 'Failed saving product.', 'error');
          }
        });
    }
  };

  // --- SCREEN 4: Spare Parts Management Controller ---
  AdminApp.screens.spares = function (container) {
    container.innerHTML =
      '<div class="screen-header">' +
        '<div>' +
          '<h1 class="screen-title">Replacement Spare Parts</h1>' +
          '<div class="screen-subtitle">Maintain in-stock components and wear items for strapping machinery</div>' +
        '</div>' +
        '<button class="btn btn-primary btn-sm" id="addSpareBtn" type="button">' +
          '<i data-lucide="plus" style="width:16px;height:16px"></i> Add Spare Part' +
        '</button>' +
      '</div>' +
      '<div class="admin-card">' +
        '<div class="admin-card-header">' +
          '<div class="toolbar">' +
            '<div class="search-box">' +
              '<i data-lucide="search"></i>' +
              '<input type="text" id="spareSearch" placeholder="Search spares by name or model...">' +
            '</div>' +
          '</div>' +
          '<div style="font-size:13px;color:var(--muted)" id="spareCountBadge">Loading...</div>' +
        '</div>' +
        '<div class="table-responsive" id="sparesTableBox">' +
          '<div style="padding:24px"><div class="skeleton-row"></div><div class="skeleton-row"></div></div>' +
        '</div>' +
      '</div>';

    var allSpares = [];
    var searchInput = document.getElementById('spareSearch');
    var countBadge = document.getElementById('spareCountBadge');
    var tableBox = document.getElementById('sparesTableBox');

    function renderTable() {
      var q = (searchInput.value || '').trim().toLowerCase();

      var filtered = allSpares.filter(function (s) {
        return !q || (s.name && s.name.toLowerCase().indexOf(q) !== -1) || (s.compatible_models && s.compatible_models.toLowerCase().indexOf(q) !== -1);
      });

      countBadge.textContent = 'Showing ' + filtered.length + ' of ' + allSpares.length + ' spare parts';

      if (!filtered.length) {
        tableBox.innerHTML =
          '<div class="empty-state">' +
            '<i data-lucide="wrench"></i>' +
            '<p>No spare parts found. Click "Add Spare Part" to add one.</p>' +
          '</div>';
        if (window.lucide) lucide.createIcons();
        return;
      }

      var html =
        '<table class="admin-table">' +
          '<thead>' +
            '<tr>' +
              '<th>Part Name</th>' +
              '<th>Compatible Models</th>' +
              '<th>Price Label</th>' +
              '<th>Inventory Status</th>' +
              '<th>Visibility</th>' +
              '<th style="text-align:right">Actions</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            filtered.map(function (s) {
              var isActive = s.is_active !== false;
              var pillCls = s.status_badge === 'in_stock' ? 'active' : (s.status_badge === 'low_stock' ? 'warning' : 'muted');
              var pillText = s.status_badge === 'in_stock' ? 'In Stock' : (s.status_badge === 'low_stock' ? 'Low Stock' : 'On Order');

              return '<tr data-id="' + esc(s._id) + '">' +
                '<td><span style="font-weight:700;color:var(--text)">' + esc(s.name) + '</span></td>' +
                '<td><span style="color:var(--muted)">' + esc(s.compatible_models || 'All Models') + '</span></td>' +
                '<td><b>' + esc(s.price_label || 'On Inquiry') + '</b></td>' +
                '<td><span class="status-pill ' + pillCls + '"><span class="led"></span> ' + esc(pillText) + '</span></td>' +
                '<td>' +
                  '<button class="status-pill ' + (isActive ? 'active' : 'muted') + ' toggle-spare-btn" type="button" style="cursor:pointer">' +
                    '<span class="led"></span> ' + (isActive ? 'Active' : 'Hidden') +
                  '</button>' +
                '</td>' +
                '<td style="text-align:right;white-space:nowrap">' +
                  '<button class="btn btn-ghost btn-sm edit-spare-btn" type="button" style="padding:5px 10px;margin-right:6px">Edit</button>' +
                  '<button class="btn btn-ghost btn-sm delete-spare-btn" type="button" style="padding:5px 10px;color:#f87171">Delete</button>' +
                '</td>' +
              '</tr>';
            }).join('') +
          '</tbody>' +
        '</table>';

      tableBox.innerHTML = html;
      if (window.lucide) lucide.createIcons();

      // Bind actions
      tableBox.querySelectorAll('.toggle-spare-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.closest('tr').getAttribute('data-id');
          var item = allSpares.find(function (x) { return x._id === id; });
          if (!item) return;

          var next = item.is_active === false;
          btn.disabled = true;

          api('/api/admin/spares/' + id, {
            method: 'PUT',
            body: { is_active: next }
          })
            .then(function (res) {
              item.is_active = res.data.is_active;
              toast(item.name + (next ? ' active on site.' : ' hidden from site.'));
              renderTable();
            })
            .catch(function (err) {
              btn.disabled = false;
              toast('Update failed: ' + err.message, 'error');
            });
        });
      });

      tableBox.querySelectorAll('.edit-spare-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.closest('tr').getAttribute('data-id');
          var item = allSpares.find(function (x) { return x._id === id; });
          if (item) openSpareModal(item);
        });
      });

      tableBox.querySelectorAll('.delete-spare-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.closest('tr').getAttribute('data-id');
          var item = allSpares.find(function (x) { return x._id === id; });
          if (!item) return;

          confirmModal(
            'Delete Spare Part',
            'Are you sure you want to permanently delete "' + item.name + '"? This will remove it from the Service & Spares page.',
            function () {
              api('/api/admin/spares/' + id, { method: 'DELETE' })
                .then(function () {
                  allSpares = allSpares.filter(function (x) { return x._id !== id; });
                  toast(item.name + ' deleted.');
                  renderTable();
                })
                .catch(function (err) { toast('Delete failed: ' + err.message, 'error'); });
            },
            'Delete Permanently'
          );
        });
      });
    }

    function loadSpares() {
      api('/api/admin/spares')
        .then(function (res) {
          allSpares = res.data || [];
          renderTable();
        })
        .catch(function (err) {
          tableBox.innerHTML = '<div style="padding:24px;color:#f87171">Failed loading spare parts: ' + esc(err.message) + '</div>';
        });
    }

    searchInput.addEventListener('input', renderTable);
    document.getElementById('addSpareBtn').addEventListener('click', function () {
      openSpareModal(null);
    });

    loadSpares();

    function openSpareModal(item) {
      var isEdit = Boolean(item);
      var statusBadge = item ? item.status_badge : 'in_stock';

      var formHtml =
        '<form id="spareModalForm" novalidate>' +
          '<div class="form-grid">' +
            '<div class="form-field full">' +
              '<label for="sp_name">Part Name *</label>' +
              '<input type="text" id="sp_name" value="' + esc(item ? item.name : '') + '" placeholder="e.g. Tungsten Heating Blade Assembly" required>' +
              '<div class="field-error" id="err_name"></div>' +
            '</div>' +
            '<div class="form-field full">' +
              '<label for="sp_models">Compatible Models *</label>' +
              '<input type="text" id="sp_models" value="' + esc(item ? item.compatible_models : 'SM-601 / SM-801') + '" placeholder="e.g. SM-601 / SM-801 / SM-450" required>' +
              '<div class="field-error" id="err_compatible_models"></div>' +
            '</div>' +
            '<div class="form-field">' +
              '<label for="sp_price_label">Price Label *</label>' +
              '<input type="text" id="sp_price_label" value="' + esc(item ? item.price_label : 'Rs 4,500') + '" placeholder="Rs 4,500" required>' +
              '<div class="field-error" id="err_price_label"></div>' +
            '</div>' +
            '<div class="form-field">' +
              '<label for="sp_price_numeric">Numeric Price (Optional)</label>' +
              '<input type="number" id="sp_price_numeric" value="' + esc(item && item.price_numeric !== undefined ? item.price_numeric : '') + '" placeholder="4500">' +
            '</div>' +
            '<div class="form-field">' +
              '<label for="sp_badge">Inventory Status *</label>' +
              '<select id="sp_badge">' +
                '<option value="in_stock"' + (statusBadge === 'in_stock' ? ' selected' : '') + '>In Stock (Ready)</option>' +
                '<option value="low_stock"' + (statusBadge === 'low_stock' ? ' selected' : '') + '>Low Stock (Limited)</option>' +
                '<option value="on_order"' + (statusBadge === 'on_order' ? ' selected' : '') + '>On Order (Lead Time)</option>' +
              '</select>' +
            '</div>' +
            '<div class="form-field">' +
              '<label for="sp_sort">Sort Order</label>' +
              '<input type="number" id="sp_sort" value="' + esc(item ? item.sort_order || 0 : 0) + '">' +
            '</div>' +
            '<div class="form-field full">' +
              '<label style="display:flex;align-items:center;gap:8px;text-transform:none;cursor:pointer">' +
                '<input type="checkbox" id="sp_active"' + (item ? (item.is_active !== false ? ' checked' : '') : ' checked') + ' style="width:16px;height:16px">' +
                '<span><b>Publish Active</b> (Display in Service &amp; Spares table)</span>' +
              '</label>' +
            '</div>' +
          '</div>' +
        '</form>';

      var footerHtml =
        '<button class="btn btn-ghost btn-sm" id="spareCancelBtn" type="button">Cancel</button>' +
        '<button class="btn btn-primary btn-sm" id="spareSaveBtn" type="button">' +
          '<span>' + (isEdit ? 'Save Changes' : 'Create Spare Part') + '</span>' +
        '</button>';

      var dlg = modal(isEdit ? 'Edit Spare Part: ' + item.name : 'Add New Spare Part', formHtml, footerHtml, function (root) {
        root.querySelector('#spareCancelBtn').addEventListener('click', closeModal);
        root.querySelector('#spareSaveBtn').addEventListener('click', function () {
          root.querySelectorAll('.field-error').forEach(function (e) { e.style.display = 'none'; });
          root.querySelectorAll('.form-field').forEach(function (f) { f.classList.remove('has-error'); });

          var name = root.querySelector('#sp_name').value.trim();
          var models = root.querySelector('#sp_models').value.trim();
          var price_label = root.querySelector('#sp_price_label').value.trim();
          var price_numeric = parseFloat(root.querySelector('#sp_price_numeric').value);
          var status_badge = root.querySelector('#sp_badge').value;
          var sort_order = parseInt(root.querySelector('#sp_sort').value, 10) || 0;
          var is_active = root.querySelector('#sp_active').checked;

          var payload = {
            name: name,
            compatible_models: models,
            price_label: price_label,
            status_badge: status_badge,
            sort_order: sort_order,
            is_active: is_active
          };
          if (!isNaN(price_numeric)) payload.price_numeric = price_numeric;

          var saveBtn = root.querySelector('#spareSaveBtn');
          saveBtn.disabled = true;

          var endpoint = isEdit ? '/api/admin/spares/' + item._id : '/api/admin/spares';
          var method = isEdit ? 'PUT' : 'POST';

          api(endpoint, { method: method, body: payload })
            .then(function (res) {
              closeModal();
              toast(res.data.name + (isEdit ? ' updated.' : ' created.'));
              loadSpares();
            })
            .catch(function (err) {
              saveBtn.disabled = false;
              if (err.details && Array.isArray(err.details)) {
                err.details.forEach(function (d) {
                  var f = root.querySelector('#err_' + d.field);
                  if (f) {
                    f.textContent = d.issue || d.message;
                    f.style.display = 'block';
                    f.closest('.form-field')?.classList.add('has-error');
                  }
                });
                toast('Please correct the errors in the form.', 'error');
              } else {
                toast(err.message || 'Error saving spare part.', 'error');
              }
            });
        });
      });
    }
  };

  // --- SCREEN 5: Global Settings & Contact Coordinates ---
  AdminApp.screens.settings = function (container) {
    container.innerHTML =
      '<div class="screen-header">' +
        '<div>' +
          '<h1 class="screen-title">Global Settings &amp; Contact Coordinates</h1>' +
          '<div class="screen-subtitle">Changes made here automatically update all contact numbers and depot addresses on the public website</div>' +
        '</div>' +
      '</div>' +
      '<div class="admin-card" id="settingsCardBox">' +
        '<div style="padding:32px"><div class="skeleton-row"></div><div class="skeleton-row"></div><div class="skeleton-row"></div></div>' +
      '</div>';

    api('/api/admin/settings')
      .then(function (res) {
        var s = res.data || {};
        var depots = Array.isArray(s.depots) ? JSON.parse(JSON.stringify(s.depots)) : [];

        var html =
          '<form id="settingsForm" style="padding:28px" novalidate>' +
            '<div style="margin-bottom:24px;border-bottom:1px solid var(--border);padding-bottom:16px">' +
              '<h3 style="margin:0 0 4px 0;font-size:16px;color:var(--text)">Primary WhatsApp &amp; Phone Routing</h3>' +
              '<p style="margin:0;font-size:12.5px;color:var(--muted)">All quotation buttons and floating WhatsApp icons point to this number.</p>' +
            '</div>' +
            '<div class="form-grid">' +
              '<div class="form-field">' +
                '<label for="set_wa">Primary WhatsApp (Raw Digits) *</label>' +
                '<input type="text" id="set_wa" value="' + esc(s.whatsapp_number || '923102261760') + '" placeholder="e.g. 923102261760" required>' +
                '<div class="field-hint" id="waPreviewText" style="color:var(--green);font-weight:600">Preview: https://wa.me/' + esc(s.whatsapp_number || '923102261760') + '</div>' +
                '<div class="field-error" id="err_whatsapp_number"></div>' +
              '</div>' +
              '<div class="form-field">' +
                '<label for="set_phone">Phone Display Text *</label>' +
                '<input type="text" id="set_phone" value="' + esc(s.phone_display || '+92 310 2261760') + '" placeholder="+92 310 2261760" required>' +
                '<div class="field-hint">Visible in header bar, engineering desk, and footer.</div>' +
              '</div>' +
              '<div class="form-field full">' +
                '<label for="set_email">Official Inquiry Email *</label>' +
                '<input type="email" id="set_email" value="' + esc(s.email || 'ar7776845@gmail.com') + '" placeholder="ar7776845@gmail.com" required>' +
              '</div>' +
            '</div>' +

            '<div style="margin:28px 0 20px;border-bottom:1px solid var(--border);padding-bottom:16px">' +
              '<h3 style="margin:0 0 4px 0;font-size:16px;color:var(--text)">Operating Hours &amp; Response SLA</h3>' +
              '<p style="margin:0;font-size:12.5px;color:var(--muted)">Displayed on contact page and inquiry confirmation notices.</p>' +
            '</div>' +
            '<div class="form-grid">' +
              '<div class="form-field">' +
                '<label for="set_hours">Standard Operating Hours</label>' +
                '<input type="text" id="set_hours" value="' + esc(s.operating_hours || 'Monday – Saturday: 9:00 AM – 9:00 PM PKT') + '">' +
              '</div>' +
              '<div class="form-field">' +
                '<label for="set_emg_hours">Emergency Dispatch Hours</label>' +
                '<input type="text" id="set_emg_hours" value="' + esc(s.emergency_hours || 'Sunday: 11:00 AM – 5:00 PM (Emergency WhatsApp Dispatch)') + '">' +
              '</div>' +
              '<div class="form-field full">' +
                '<label for="set_response_note">Response Time Note</label>' +
                '<input type="text" id="set_response_note" value="' + esc(s.response_time_note || 'Average response ~6 min • Mon–Sat 9am – 9pm PKT') + '">' +
              '</div>' +
            '</div>' +

            '<div style="margin:28px 0 20px;border-bottom:1px solid var(--border);padding-bottom:16px;display:flex;justify-content:space-between;align-items:center">' +
              '<div>' +
                '<h3 style="margin:0 0 4px 0;font-size:16px;color:var(--text)">Physical Depots &amp; Walk-In Hubs</h3>' +
                '<p style="margin:0;font-size:12.5px;color:var(--muted)">Regional service centers and spares warehouses displayed on contact page.</p>' +
              '</div>' +
              '<button class="btn btn-ghost btn-sm" id="addDepotBtn" type="button">+ Add Depot Location</button>' +
            '</div>' +

            '<div id="depotsContainer" style="display:flex;flex-direction:column;gap:14px;margin-bottom:28px"></div>' +

            '<div style="display:flex;justify-content:flex-end;border-top:1px solid var(--border);padding-top:20px">' +
              '<button class="btn btn-primary" id="saveSettingsBtn" type="submit">' +
                '<i data-lucide="check" style="width:16px;height:16px"></i> Save All Settings' +
              '</button>' +
            '</div>' +
          '</form>';

        var cardBox = document.getElementById('settingsCardBox');
        cardBox.innerHTML = html;
        if (window.lucide) lucide.createIcons();

        // Live preview of WhatsApp
        var waInput = cardBox.querySelector('#set_wa');
        var waPreview = cardBox.querySelector('#waPreviewText');
        function updateWaPreview() {
          var raw = waInput.value.replace(/\D/g, '');
          if (raw.startsWith('03') && raw.length === 11) raw = '92' + raw.substring(1);
          waPreview.textContent = 'Preview: https://wa.me/' + (raw || '923102261760');
        }
        waInput.addEventListener('input', updateWaPreview);

        // Depots Repeater
        var depotsBox = cardBox.querySelector('#depotsContainer');
        function renderDepots() {
          if (!depots.length) {
            depotsBox.innerHTML = '<div style="color:var(--muted);font-size:13.5px;padding:12px;background:var(--panel-2);border-radius:var(--radius-md);text-align:center">No depots configured. Click "+ Add Depot Location" above.</div>';
            return;
          }

          depotsBox.innerHTML = depots.map(function (d, idx) {
            return '<div class="admin-card" style="margin:0;background:var(--panel-2)" data-idx="' + idx + '">' +
              '<div class="admin-card-header" style="padding:12px 18px">' +
                '<span style="font-weight:700;font-size:13.5px">' + esc(d.city || 'Depot ' + (idx + 1)) + (d.hub_name ? ' — ' + esc(d.hub_name) : '') + '</span>' +
                '<button class="btn-icon danger del-depot-btn" type="button" title="Remove depot">&times;</button>' +
              '</div>' +
              '<div class="admin-card-body" style="padding:18px">' +
                '<div class="form-grid">' +
                  '<div class="form-field">' +
                    '<label>City Name *</label>' +
                    '<input type="text" class="d-city" value="' + esc(d.city || '') + '" placeholder="Karachi" required>' +
                  '</div>' +
                  '<div class="form-field">' +
                    '<label>Hub Display Name *</label>' +
                    '<input type="text" class="d-hub" value="' + esc(d.hub_name || '') + '" placeholder="Karachi Central" required>' +
                  '</div>' +
                  '<div class="form-field full">' +
                    '<label>Physical Street Address *</label>' +
                    '<input type="text" class="d-addr" value="' + esc(d.address || '') + '" placeholder="Plot 14, S.I.T.E Industrial Area, Karachi" required>' +
                  '</div>' +
                  '<div class="form-field">' +
                    '<label>Hub Type</label>' +
                    '<input type="text" class="d-type" value="' + esc(d.hub_type || 'Direct Display & Spares Depot') + '">' +
                  '</div>' +
                  '<div class="form-field">' +
                    '<label>Operating Hours</label>' +
                    '<input type="text" class="d-hours" value="' + esc(d.hours || 'Mon–Sat 9:00 AM – 9:00 PM PKT') + '">' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
          }).join('');

          depotsBox.querySelectorAll('.del-depot-btn').forEach(function (b) {
            b.addEventListener('click', function () {
              var idx = parseInt(b.closest('[data-idx]').getAttribute('data-idx'), 10);
              depots.splice(idx, 1);
              renderDepots();
            });
          });
        }
        renderDepots();

        cardBox.querySelector('#addDepotBtn').addEventListener('click', function () {
          depots.push({
            city: 'Lahore',
            hub_name: 'Lahore Hub',
            address: 'Sundar Industrial Estate',
            hub_type: 'Technician Base',
            hours: 'Mon–Sat 9:00 AM – 8:00 PM PKT',
            note: ''
          });
          renderDepots();
        });

        // Form Submit
        cardBox.querySelector('#settingsForm').addEventListener('submit', function (e) {
          e.preventDefault();

          // Sync depots from DOM
          var updatedDepots = [];
          depotsBox.querySelectorAll('[data-idx]').forEach(function (row) {
            updatedDepots.push({
              city: row.querySelector('.d-city').value.trim(),
              hub_name: row.querySelector('.d-hub').value.trim(),
              address: row.querySelector('.d-addr').value.trim(),
              hub_type: row.querySelector('.d-type').value.trim(),
              hours: row.querySelector('.d-hours').value.trim(),
              note: ''
            });
          });

          var payload = {
            whatsapp_number: waInput.value.trim(),
            phone_display: cardBox.querySelector('#set_phone').value.trim(),
            email: cardBox.querySelector('#set_email').value.trim(),
            operating_hours: cardBox.querySelector('#set_hours').value.trim(),
            emergency_hours: cardBox.querySelector('#set_emg_hours').value.trim(),
            response_time_note: cardBox.querySelector('#set_response_note').value.trim(),
            depots: updatedDepots
          };

          var saveBtn = cardBox.querySelector('#saveSettingsBtn');
          saveBtn.disabled = true;

          api('/api/admin/settings', {
            method: 'PUT',
            body: payload
          })
            .then(function (res) {
              saveBtn.disabled = false;
              toast('Settings saved successfully. Public website updated.');
              // Also update sessionStorage cache for instant public paint
              try { sessionStorage.setItem('sm_settings', JSON.stringify(res.data)); } catch (e) {}
            })
            .catch(function (err) {
              saveBtn.disabled = false;
              toast(err.message || 'Failed saving settings.', 'error');
            });
        });
      })
      .catch(function (err) {
        document.getElementById('settingsCardBox').innerHTML = '<div style="padding:24px;color:#f87171">Failed loading settings: ' + esc(err.message) + '</div>';
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
