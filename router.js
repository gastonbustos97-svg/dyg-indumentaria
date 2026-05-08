/* ============================================
   DYGIndumentaria — Router & Topbar
   ============================================ */

// ── Page registry ────────────────────────────
const PAGES = {
  dashboard: { label: 'Dashboard',  sub: 'Resumen general',           render: renderDashboard  },
  catalog:   { label: 'Catálogo',   sub: 'Inventario de prendas',     render: renderCatalog    },
  sales:     { label: 'Ventas',     sub: 'Historial y registro',      render: renderSales      },
  clients:   { label: 'Clientas',   sub: 'Gestión de clientas',       render: renderClients    },
  debts:     { label: 'Fiados',     sub: 'Cuentas corrientes',        render: renderDebts      },
  cash:      { label: 'Caja',       sub: 'Control de caja diaria',    render: renderCash       },
  reports:   { label: 'Reportes',   sub: 'Estadísticas y análisis',   render: renderReports    },
};

let currentPage = null;
window.currentPage = null;

function navigate(pageId) {
  if (!PAGES[pageId]) return;

  // Update nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pageId);
  });

  // Update topbar
  const topbarName = document.getElementById('topbar-page-name');
  const topbarSub  = document.getElementById('topbar-page-sub');
  if (topbarName) topbarName.textContent = PAGES[pageId].label;
  if (topbarSub)  topbarSub.textContent  = PAGES[pageId].sub;

  // Deactivate all pages
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));

  // Activate target
  const pageEl = document.getElementById('page-' + pageId);
  if (pageEl) {
    pageEl.classList.add('active');
    // Re-run page render
    PAGES[pageId].render();
  }

  currentPage = pageId;
  window.currentPage = pageId;

  // Sync bottom nav
  document.querySelectorAll('.bottom-nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pageId);
  });

  // Close mobile sidebar
  closeSidebar();

  // Update badge count (debts)
  updateDebtBadge();
}

// ── Sidebar Mobile ───────────────────────────
function openSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('sidebar-overlay')?.classList.add('open');
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('open');
}

// ── Debt Badge Update ────────────────────────
function updateDebtBadge() {
  const pendingDebts = store.getDebts().filter(d => !d.isPaid).length;
  // Sidebar badge
  const badge = document.getElementById('debts-nav-badge');
  if (badge) {
    badge.textContent = pendingDebts;
    badge.style.display = pendingDebts > 0 ? '' : 'none';
  }
  // Bottom nav badge
  const bottomBadge = document.getElementById('debts-bottom-badge');
  if (bottomBadge) {
    bottomBadge.textContent = pendingDebts;
    bottomBadge.style.display = pendingDebts > 0 ? '' : 'none';
  }
}

// ── Global Search ────────────────────────────
function handleGlobalSearch(query) {
  query = query.trim().toLowerCase();
  if (!query) return;

  // Simple: search in clients and products, navigate to most relevant
  const clients = store.getClients().filter(c =>
    c.name.toLowerCase().includes(query)
  );
  const products = store.getProducts().filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );

  if (clients.length > 0) {
    navigate('clients');
    toast(`Buscando "${query}" en clientas`, 'info');
  } else if (products.length > 0) {
    navigate('catalog');
    toast(`Buscando "${query}" en catálogo`, 'info');
  } else {
    toast('Sin resultados para "' + query + '"', 'warning');
  }
}
