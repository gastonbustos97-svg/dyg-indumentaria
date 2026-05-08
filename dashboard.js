/* ============================================
   DYGIndumentaria — Dashboard Page
   ============================================ */

let dashboardChart = null;
let dashboardDonut = null;

function renderDashboard() {
  const sales    = store.getSales();
  const debts    = store.getDebts().filter(d => !d.isPaid);
  const totalDebt = store.getTotalDebt();
  const todayFrom = new Date(); todayFrom.setHours(0,0,0,0);
  const todaySales = sales.filter(s => s.date >= todayFrom.getTime());
  const todayRev   = store.getTotalRevenue(todayFrom.getTime());
  const monthFrom  = new Date(); monthFrom.setDate(1); monthFrom.setHours(0,0,0,0);
  const monthRev   = store.getTotalRevenue(monthFrom.getTime());
  const totalStock = store.getTotalStock();

  const page = document.getElementById('page-dashboard');
  if (!page) return;

  page.innerHTML = `
    <!-- Stats -->
    <div class="stats-grid" id="dash-stats">
      <div class="stat-card animate-fade-in-up stagger-1"
           style="--accent-color:rgba(110,203,154,0.15);--accent-border:rgba(110,203,154,0.25);
                  --icon-bg:rgba(110,203,154,0.08);--icon-border:rgba(110,203,154,0.2)">
        <div class="stat-card-icon">💰</div>
        <div class="stat-card-label">Ventas Hoy</div>
        <div class="stat-card-value" id="dash-today-rev">${fmt(0)}</div>
        <div class="stat-card-trend up">▲ ${todaySales.length} venta${todaySales.length!==1?'s':''}</div>
      </div>

      <div class="stat-card animate-fade-in-up stagger-2"
           style="--accent-color:rgba(201,169,110,0.15);--accent-border:rgba(201,169,110,0.25);
                  --icon-bg:rgba(201,169,110,0.08);--icon-border:rgba(201,169,110,0.2)">
        <div class="stat-card-icon">📅</div>
        <div class="stat-card-label">Ventas del Mes</div>
        <div class="stat-card-value" id="dash-month-rev">${fmt(0)}</div>
        <div class="stat-card-trend up">▲ Este mes</div>
      </div>

      <div class="stat-card animate-fade-in-up stagger-3"
           style="--accent-color:rgba(232,112,112,0.15);--accent-border:rgba(232,112,112,0.25);
                  --icon-bg:rgba(232,112,112,0.08);--icon-border:rgba(232,112,112,0.2)">
        <div class="stat-card-icon">⚠️</div>
        <div class="stat-card-label">Total en Deudas</div>
        <div class="stat-card-value text-danger" id="dash-debts">${fmt(0)}</div>
        <div class="stat-card-trend down">▼ ${debts.length} deuda${debts.length!==1?'s':''} pendiente${debts.length!==1?'s':''}</div>
      </div>

      <div class="stat-card animate-fade-in-up stagger-4"
           style="--accent-color:rgba(110,168,232,0.15);--accent-border:rgba(110,168,232,0.25);
                  --icon-bg:rgba(110,168,232,0.08);--icon-border:rgba(110,168,232,0.2)">
        <div class="stat-card-icon">👗</div>
        <div class="stat-card-label">Prendas en Stock</div>
        <div class="stat-card-value" id="dash-stock">0</div>
        <div class="stat-card-trend" style="color:var(--info)">▶ ${store.getProducts().length} productos</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions animate-fade-in-up stagger-2">
      <div class="quick-action-btn" onclick="navigate('catalog');openAddProductModal()">
        <div class="quick-action-icon">➕</div>
        <div class="quick-action-label">Nueva Prenda</div>
      </div>
      <div class="quick-action-btn" onclick="navigate('sales');openAddSaleModal()">
        <div class="quick-action-icon">🛍️</div>
        <div class="quick-action-label">Registrar Venta</div>
      </div>
      <div class="quick-action-btn" onclick="navigate('clients');openAddClientModal()">
        <div class="quick-action-icon">👩</div>
        <div class="quick-action-label">Nueva Clienta</div>
      </div>
      <div class="quick-action-btn" onclick="navigate('debts');openAddDebtModal()">
        <div class="quick-action-icon">💳</div>
        <div class="quick-action-label">Registrar Deuda</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="dashboard-charts-row">
      <div class="chart-card animate-fade-in-up stagger-3">
        <div class="chart-card-header">
          <div>
            <div class="chart-card-title">Ventas — Últimos 30 días</div>
            <div class="chart-card-sub">Ingresos por día</div>
          </div>
          <span class="badge badge-gold">30 días</span>
        </div>
        <div class="chart-wrap">
          <canvas id="dash-sales-chart"></canvas>
        </div>
      </div>

      <div class="chart-card animate-fade-in-up stagger-4">
        <div class="chart-card-header">
          <div>
            <div class="chart-card-title">Métodos de Pago</div>
            <div class="chart-card-sub">Distribución</div>
          </div>
        </div>
        <div class="chart-wrap" style="height:200px">
          <canvas id="dash-payment-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Bottom row -->
    <div class="grid-2" style="gap:18px">
      <!-- Recent sales -->
      <div class="card animate-fade-in-up stagger-4">
        <div class="chart-card-header">
          <div class="chart-card-title">Últimas Ventas</div>
          <button class="btn btn-ghost btn-sm" onclick="navigate('sales')">Ver todas →</button>
        </div>
        <div class="activity-list" id="dash-recent-sales">
          ${renderRecentSalesHTML(sales.slice(0, 6))}
        </div>
      </div>

      <!-- Debts list -->
      <div class="card animate-fade-in-up stagger-5">
        <div class="chart-card-header">
          <div class="chart-card-title">Deudas Activas</div>
          <button class="btn btn-ghost btn-sm" onclick="navigate('debts')">Ver todas →</button>
        </div>
        ${debts.length === 0
          ? `<div class="empty-state" style="padding:30px"><div class="empty-state-icon">🎉</div>
             <div class="empty-state-title">¡Sin deudas!</div></div>`
          : `<div class="debt-alert-list" id="dash-debts-list">
              ${debts.slice(0, 5).map(d => `
                <div class="debt-alert-item" onclick="navigate('debts')">
                  ${avatarHTML(d.clientName, null, 'sm')}
                  <div style="flex:1;min-width:0">
                    <div class="debt-alert-name">${esc(d.clientName)}</div>
                    <div style="font-size:.72rem;color:var(--text-muted)">${esc(d.description)}</div>
                  </div>
                  <div class="debt-alert-amount">${fmt(d.totalAmount - d.paidAmount)}</div>
                </div>
              `).join('')}
            </div>`
        }
      </div>
    </div>
  `;

  // Animate counters
  setTimeout(() => {
    const el1 = document.getElementById('dash-today-rev');
    const el2 = document.getElementById('dash-month-rev');
    const el3 = document.getElementById('dash-debts');
    const el4 = document.getElementById('dash-stock');
    if (el1) animateCount(el1, todayRev, 800, '$');
    if (el2) animateCount(el2, monthRev, 900, '$');
    if (el3) animateCount(el3, totalDebt, 1000, '$');
    if (el4) animateCount(el4, totalStock, 700);
  }, 200);

  // Charts
  setTimeout(() => renderDashboardCharts(sales), 300);
}

function renderRecentSalesHTML(sales) {
  if (!sales.length) return `<div class="table-empty"><div class="table-empty-icon">🛍️</div><p>Sin ventas registradas</p></div>`;
  const colors = ['var(--gold)', 'var(--success)', 'var(--rose)', 'var(--info)', 'var(--warning)', 'var(--danger)'];
  return sales.map((s, i) => `
    <div class="activity-item animate-fade-in-up" style="animation-delay:${i*0.05}s">
      <div class="activity-dot" style="background:${colors[i % colors.length]}"></div>
      <div class="activity-info">
        <div class="activity-name">${esc(s.productName)}</div>
        <div class="activity-sub">${esc(s.clientName)} · ${fmtDate(s.date, 'relative')}</div>
      </div>
      <div class="activity-amount" style="color:${s.isPaid ? 'var(--success)' : 'var(--danger)'}">
        ${s.isPaid ? '' : '⚡ '}${fmt(s.price * (s.qty||1))}
      </div>
    </div>
  `).join('');
}

function renderDashboardCharts(sales) {
  // ── Sales line chart ──
  const ctx1 = document.getElementById('dash-sales-chart');
  if (!ctx1) return;

  // Build 30-day buckets
  const days = 30;
  const labels = [];
  const data   = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    const dayEnd = d.getTime() + 86400000;
    const dayStart = d.getTime();
    labels.push(d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }));
    const rev = store.getTotalRevenue(dayStart, dayEnd);
    data.push(rev);
  }

  if (dashboardChart) { dashboardChart.destroy(); dashboardChart = null; }

  dashboardChart = new Chart(ctx1, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#C9A96E',
        backgroundColor: 'rgba(201,169,110,0.08)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#C9A96E',
        pointRadius: 3,
        pointHoverRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13,13,24,0.95)',
          borderColor: 'rgba(201,169,110,0.3)',
          borderWidth: 1,
          titleColor: '#C9A96E',
          bodyColor: '#A09890',
          callbacks: {
            label: ctx => ' $' + new Intl.NumberFormat('es-AR').format(ctx.parsed.y),
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#605858', font: { size: 10 }, maxTicksLimit: 10 },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#605858', font: { size: 10 },
            callback: v => '$' + new Intl.NumberFormat('es-AR').format(v),
          },
          beginAtZero: true,
        },
      },
    },
  });

  // ── Payment method donut ──
  const ctx2 = document.getElementById('dash-payment-chart');
  if (!ctx2) return;

  const methods = {};
  for (const s of sales) {
    methods[s.paymentMethod] = (methods[s.paymentMethod] || 0) + 1;
  }

  if (dashboardDonut) { dashboardDonut.destroy(); dashboardDonut = null; }

  dashboardDonut = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: Object.keys(methods),
      datasets: [{
        data: Object.values(methods),
        backgroundColor: ['rgba(201,169,110,0.7)', 'rgba(110,203,154,0.7)', 'rgba(232,201,110,0.7)', 'rgba(110,168,232,0.7)', 'rgba(212,165,165,0.7)'],
        borderColor: 'rgba(13,13,24,0.8)',
        borderWidth: 2,
        hoverBorderWidth: 3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#A09890', font: { size: 11 }, padding: 12, boxWidth: 12 },
        },
        tooltip: {
          backgroundColor: 'rgba(13,13,24,0.95)',
          borderColor: 'rgba(201,169,110,0.3)',
          borderWidth: 1,
          titleColor: '#C9A96E',
          bodyColor: '#A09890',
        },
      },
      cutout: '70%',
    },
  });
}
