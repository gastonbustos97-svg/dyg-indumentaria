/* ============================================
   DYGIndumentaria — Reports Page
   ============================================ */

let reportPeriod    = 30;
let reportsBarChart = null;
let reportsDonut    = null;

function renderReports() {
  const page = document.getElementById('page-reports');
  if (!page) return;

  page.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>Reportes & Estadísticas</h2>
        <p>Análisis completo de tu negocio</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary btn-sm" onclick="printReport()">🖨️ Imprimir</button>
      </div>
    </div>

    <!-- Period selector -->
    <div class="reports-period-selector">
      <button class="period-btn ${reportPeriod===7?'active':''}"  onclick="setReportPeriod(7,this)">7 días</button>
      <button class="period-btn ${reportPeriod===30?'active':''}" onclick="setReportPeriod(30,this)">30 días</button>
      <button class="period-btn ${reportPeriod===90?'active':''}" onclick="setReportPeriod(90,this)">3 meses</button>
      <button class="period-btn ${reportPeriod===365?'active':''}" onclick="setReportPeriod(365,this)">1 año</button>
    </div>

    <!-- KPI row -->
    <div class="stats-grid" id="report-kpis" style="margin-bottom:22px">
      ${renderReportKPIs()}
    </div>

    <!-- Charts row -->
    <div class="reports-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-bottom:18px">
      <div class="chart-card">
        <div class="chart-card-header">
          <div>
            <div class="chart-card-title">Ingresos por Período</div>
            <div class="chart-card-sub" id="report-period-label">Últimos ${reportPeriod} días</div>
          </div>
        </div>
        <div class="chart-wrap" style="height:240px">
          <canvas id="report-bar-chart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-card-header">
          <div>
            <div class="chart-card-title">Categorías más vendidas</div>
            <div class="chart-card-sub">Por cantidad de prendas</div>
          </div>
        </div>
        <div class="chart-wrap" style="height:240px">
          <canvas id="report-cat-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Bottom row -->
    <div class="reports-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:18px">
      <!-- Top products -->
      <div class="chart-card">
        <div class="chart-card-header">
          <div class="chart-card-title">🏆 Productos Más Vendidos</div>
        </div>
        <div class="report-metric-list" id="report-top-products">
          ${renderTopProductsHTML()}
        </div>
      </div>

      <!-- Top clients -->
      <div class="chart-card">
        <div class="chart-card-header">
          <div class="chart-card-title">👑 Mejores Clientas</div>
        </div>
        <div class="report-metric-list" id="report-top-clients">
          ${renderTopClientsHTML()}
        </div>
      </div>
    </div>

    <!-- Stock alerts -->
    <div class="chart-card" style="margin-top:18px">
      <div class="chart-card-header">
        <div class="chart-card-title">⚠️ Alertas de Stock</div>
        <div class="chart-card-sub">Prendas con stock bajo o agotado</div>
      </div>
      ${renderStockAlertsHTML()}
    </div>
  `;

  setTimeout(() => renderReportsCharts(), 200);
}

function renderReportKPIs() {
  const from = Date.now() - reportPeriod * 86400000;
  const sales = store.getSalesByPeriod(reportPeriod);
  const paidSales   = sales; // Count all sales for units/tickets
  const revenue     = store.getTotalRevenue(from);
  const totalUnits  = sales.reduce((s, v) => s + (v.qty||1), 0);
  const avgTicket   = sales.length ? revenue / sales.length : 0;
  const totalDebt   = store.getTotalDebt();

  return `
    <div class="stat-card" style="--icon-bg:rgba(110,203,154,0.08);--icon-border:rgba(110,203,154,0.2)">
      <div class="stat-card-icon">💵</div>
      <div class="stat-card-label">Ingresos (${reportPeriod}d)</div>
      <div class="stat-card-value">${fmt(revenue)}</div>
      <div class="stat-card-trend up">▲ ${paidSales.length} ventas</div>
    </div>
    <div class="stat-card" style="--icon-bg:rgba(201,169,110,0.08);--icon-border:rgba(201,169,110,0.2)">
      <div class="stat-card-icon">🛍️</div>
      <div class="stat-card-label">Prendas Vendidas</div>
      <div class="stat-card-value">${totalUnits}</div>
      <div class="stat-card-trend up">▲ Período seleccionado</div>
    </div>
    <div class="stat-card" style="--icon-bg:rgba(212,165,165,0.08);--icon-border:rgba(212,165,165,0.2)">
      <div class="stat-card-icon">🎯</div>
      <div class="stat-card-label">Ticket Promedio</div>
      <div class="stat-card-value">${fmt(avgTicket)}</div>
      <div class="stat-card-trend" style="color:var(--rose)">▶ Por venta</div>
    </div>
    <div class="stat-card" style="--icon-bg:rgba(232,112,112,0.08);--icon-border:rgba(232,112,112,0.2)">
      <div class="stat-card-icon">⚠️</div>
      <div class="stat-card-label">Deuda Total</div>
      <div class="stat-card-value text-danger">${fmt(totalDebt)}</div>
      <div class="stat-card-trend down">▼ Pendiente de cobro</div>
    </div>
  `;
}

function setReportPeriod(period, btn) {
  reportPeriod = period;
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const label = document.getElementById('report-period-label');
  if (label) label.textContent = `Últimos ${period} días`;
  // Update KPIs
  const kpis = document.getElementById('report-kpis');
  if (kpis) kpis.innerHTML = renderReportKPIs();
  // Redraw charts
  setTimeout(() => renderReportsCharts(), 100);
}

function renderTopProductsHTML() {
  const top = store.getTopProducts(5);
  if (!top.length) return `<div class="empty-state" style="padding:24px"><div class="empty-state-icon">📦</div><p>Sin datos</p></div>`;
  const maxQty = top[0].qty || 1;

  return top.map((p, i) => `
    <div class="report-metric-item">
      <div class="report-metric-rank">${i + 1}</div>
      <div style="flex:1;min-width:0">
        <div class="report-metric-name">${esc(p.name)}</div>
        <div class="report-metric-bar-wrap">
          <div class="report-metric-bar" style="width:${Math.round((p.qty/maxQty)*100)}%"></div>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0;margin-left:12px">
        <div class="report-metric-value">${p.qty} ud.</div>
        <div style="font-size:.7rem;color:var(--text-muted)">${fmt(p.revenue)}</div>
      </div>
    </div>
  `).join('');
}

function renderTopClientsHTML() {
  const clients = store.getClients();
  const clientData = clients.map(c => {
    const sales = store.getClientSales(c.id).filter(s => s.isPaid);
    return {
      name: c.name,
      purchases: sales.length,
      spent: sales.reduce((sum, s) => sum + s.price * (s.qty||1), 0),
    };
  }).sort((a,b) => b.spent - a.spent).slice(0, 5);

  if (!clientData.length || clientData[0].spent === 0) {
    return `<div class="empty-state" style="padding:24px"><div class="empty-state-icon">👩</div><p>Sin datos</p></div>`;
  }

  const maxSpent = clientData[0].spent || 1;

  return clientData.filter(c => c.spent > 0).map((c, i) => `
    <div class="report-metric-item">
      <div class="report-metric-rank">${i + 1}</div>
      <div style="flex:1;min-width:0">
        <div class="report-metric-name">${esc(c.name)}</div>
        <div class="report-metric-bar-wrap">
          <div class="report-metric-bar" style="width:${Math.round((c.spent/maxSpent)*100)}%;background:var(--grad-rose)"></div>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0;margin-left:12px">
        <div class="report-metric-value">${fmt(c.spent)}</div>
        <div style="font-size:.7rem;color:var(--text-muted)">${c.purchases} compra${c.purchases !== 1 ? 's' : ''}</div>
      </div>
    </div>
  `).join('');
}

function renderStockAlertsHTML() {
  const products = store.getProducts();
  const alerts = [];

  for (const p of products) {
    for (const v of p.variants) {
      if (v.stock <= 3) {
        alerts.push({ product: p.name, size: v.size, color: v.color, colorHex: v.colorHex, stock: v.stock });
      }
    }
  }

  alerts.sort((a,b) => a.stock - b.stock);

  if (!alerts.length) return `
    <div class="empty-state" style="padding:24px">
      <div class="empty-state-icon">✅</div>
      <div class="empty-state-title">¡Stock OK!</div>
      <div class="empty-state-desc">Todas las variantes tienen stock suficiente</div>
    </div>
  `;

  return `
    <div class="table-wrap" style="border:none">
      <table class="table">
        <thead><tr><th>Prenda</th><th>Talle</th><th>Color</th><th>Stock</th><th>Estado</th></tr></thead>
        <tbody>
          ${alerts.slice(0, 15).map(a => `
            <tr>
              <td style="font-weight:500;color:var(--text-primary)">${esc(a.product)}</td>
              <td><span class="chip">${esc(a.size)}</span></td>
              <td><div style="display:flex;align-items:center;gap:6px">${colorDotHTML(a.colorHex)}${esc(a.color)}</div></td>
              <td style="font-weight:700;font-size:1rem;color:${a.stock === 0 ? 'var(--danger)' : 'var(--warning)'}">${a.stock}</td>
              <td>${a.stock === 0
                ? `<span class="badge badge-danger">Agotado</span>`
                : `<span class="badge badge-warning">Stock bajo</span>`
              }</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderReportsCharts() {
  // ── Bar chart ──
  const ctx1 = document.getElementById('report-bar-chart');
  if (!ctx1) return;

  const sales = store.getSalesByPeriod(reportPeriod);
  let labels = [], data = [];

  if (reportPeriod <= 30) {
    // Daily buckets
    for (let i = reportPeriod - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      labels.push(d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }));
      const rev = store.getTotalRevenue(d.getTime(), d.getTime() + 86400000);
      data.push(rev);
    }
  } else {
    // Weekly buckets
    const weeks = Math.ceil(reportPeriod / 7);
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = Date.now() - (i + 1) * 7 * 86400000;
      const weekEnd   = Date.now() - i * 7 * 86400000;
      const d = new Date(weekStart);
      labels.push(`${d.toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit' })}`);
      const rev = store.getTotalRevenue(weekStart, weekEnd);
      data.push(rev);
    }
  }

  if (reportsBarChart) { reportsBarChart.destroy(); reportsBarChart = null; }

  reportsBarChart = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: 'rgba(201,169,110,0.5)',
        borderColor: '#C9A96E',
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(201,169,110,0.75)',
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
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#605858', font: { size: 10 }, maxTicksLimit: 12 } },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#605858', font: { size: 10 }, callback: v => '$' + new Intl.NumberFormat('es-AR').format(v) },
          beginAtZero: true,
        },
      },
    },
  });

  // ── Category donut ──
  const ctx2 = document.getElementById('report-cat-chart');
  if (!ctx2) return;

  const catCounts = {};
  for (const s of sales) {
    const p = store.getProduct(s.productId);
    const cat = p?.category || 'Otro';
    catCounts[cat] = (catCounts[cat] || 0) + (s.qty || 1);
  }

  if (reportsDonut) { reportsDonut.destroy(); reportsDonut = null; }

  if (Object.keys(catCounts).length === 0) {
    ctx2.parentNode.innerHTML = `<div class="empty-state" style="padding:40px;height:240px">
      <div class="empty-state-icon">📊</div><p>Sin datos de ventas</p></div>`;
    return;
  }

  reportsDonut = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: Object.keys(catCounts),
      datasets: [{
        data: Object.values(catCounts),
        backgroundColor: [
          'rgba(201,169,110,0.7)', 'rgba(212,165,165,0.7)', 'rgba(110,203,154,0.7)',
          'rgba(110,168,232,0.7)', 'rgba(232,201,110,0.7)', 'rgba(232,112,112,0.7)',
          'rgba(180,140,200,0.7)', 'rgba(100,200,180,0.7)',
        ],
        borderColor: 'rgba(13,13,24,0.8)',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#A09890', font: { size: 11 }, padding: 10, boxWidth: 12 },
        },
        tooltip: {
          backgroundColor: 'rgba(13,13,24,0.95)',
          borderColor: 'rgba(201,169,110,0.3)',
          borderWidth: 1,
          titleColor: '#C9A96E',
          bodyColor: '#A09890',
        },
      },
      cutout: '65%',
    },
  });
}

function printReport() {
  window.print();
}
