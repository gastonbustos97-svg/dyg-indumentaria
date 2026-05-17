/* ============================================
   DYGIndumentaria — Sales Page
   ============================================ */

function renderSales() {
  const page  = document.getElementById('page-sales');
  if (!page) return;

  const sales = store.getSales();
  const today      = new Date(); today.setHours(0,0,0,0);
  const weekFrom   = Date.now() - 7  * 86400000;
  const monthFrom  = new Date(); monthFrom.setDate(1); monthFrom.setHours(0,0,0,0);

  const todayRev = sales.filter(s => s.isPaid && s.date >= today.getTime()).reduce((s,v) => s + v.price*(v.qty||1), 0);
  const weekRev  = sales.filter(s => s.isPaid && s.date >= weekFrom).reduce((s,v) => s + v.price*(v.qty||1), 0);
  const monthRev = sales.filter(s => s.isPaid && s.date >= monthFrom.getTime()).reduce((s,v) => s + v.price*(v.qty||1), 0);

  page.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>Ventas</h2>
        <p>${sales.length} venta${sales.length!==1?'s':''} registradas</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary" onclick="openAddSaleModal()">🛍️ Nueva Venta</button>
      </div>
    </div>

    <!-- Summary -->
    <div class="stats-grid sales-summary-row">
      <div class="stat-card" style="--icon-bg:rgba(110,203,154,0.08);--icon-border:rgba(110,203,154,0.2)">
        <div class="stat-card-icon">☀️</div>
        <div class="stat-card-label">Ventas Hoy</div>
        <div class="stat-card-value">${fmt(todayRev)}</div>
      </div>
      <div class="stat-card" style="--icon-bg:rgba(201,169,110,0.08);--icon-border:rgba(201,169,110,0.2)">
        <div class="stat-card-icon">📆</div>
        <div class="stat-card-label">Esta Semana</div>
        <div class="stat-card-value">${fmt(weekRev)}</div>
      </div>
      <div class="stat-card" style="--icon-bg:rgba(110,168,232,0.08);--icon-border:rgba(110,168,232,0.2)">
        <div class="stat-card-icon">📅</div>
        <div class="stat-card-label">Este Mes</div>
        <div class="stat-card-value">${fmt(monthRev)}</div>
      </div>
    </div>

    <!-- Filter row -->
    <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;align-items:center">
      <div class="form-control-icon" style="max-width:240px">
        <span class="icon">🔍</span>
        <input class="form-control" id="sales-search" placeholder="Buscar por clienta o prenda..."
               oninput="filterSalesTable(this.value)">
      </div>
      <select class="form-control" id="sales-filter-payment" style="max-width:180px" onchange="filterSalesTable()">
        <option value="">Todos los medios</option>
        <option value="Efectivo">Efectivo</option>
        <option value="Transferencia">Transferencia</option>
        <option value="Cuenta corriente">Cuenta corriente</option>
      </select>
      <select class="form-control" id="sales-filter-status" style="max-width:160px" onchange="filterSalesTable()">
        <option value="">Todos</option>
        <option value="paid">Pagadas</option>
        <option value="pending">Pendientes</option>
      </select>
    </div>

    <!-- Sales list -->
    <div id="sales-tbody">
      ${renderSalesTbody(sales)}
    </div>
  `;

  window._allSales = sales;
}

function renderSalesTbody(sales) {
  if (!sales.length) return `
    <div class="table-empty" style="padding:40px;text-align:center">
      <div class="table-empty-icon">🛍️</div>
      <p>Sin ventas registradas</p>
    </div>
  `;

  return `
    <div class="sales-cards">
      ${sales.map((s, i) => `
        <div class="sale-card ${s.isPaid ? 'paid' : 'pending'} animate-fade-in-up" style="animation-delay:${i*0.02}s">
          <div class="sale-card-inner">
            <div class="sale-card-main">
              <div class="sale-card-left">
                ${avatarHTML(s.clientName, null, 'sm')}
                <div class="sale-card-info">
                  <div class="sale-card-product">${esc(s.productName)}</div>
                  <div class="sale-card-client">👩 ${esc(s.clientName)}</div>
                  ${s.variant ? `
                    <div class="sale-card-variant">
                      ${colorDotHTML(s.variant.colorHex, s.variant.color)}
                      <span>${esc(s.variant.size)} · ${esc(s.variant.color)}</span>
                      ${(s.qty||1) > 1 ? `<span style="color:var(--text-muted)">× ${s.qty}</span>` : ''}
                    </div>` : ''}
                </div>
              </div>
              <div class="sale-card-right">
                <div class="sale-card-total">${fmt(s.price * (s.qty||1))}</div>
                <div class="sale-card-date">${fmtDate(s.date, 'relative')}</div>
                <button class="btn btn-danger btn-sm btn-icon" onclick="deleteSaleConfirm('${esc(s.id)}')">🗑️</button>
              </div>
            </div>
            <div class="sale-card-footer">
              ${paymentBadge(s.paymentMethod)}
              ${s.isPaid
                ? `<span class="badge badge-success">✓ Pagada</span>`
                : `<span class="badge badge-warning">⏳ Pendiente</span>`
              }
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function filterSalesTable(searchVal) {
  const search  = (searchVal !== undefined ? searchVal : document.getElementById('sales-search')?.value || '').toLowerCase();
  const payment = document.getElementById('sales-filter-payment')?.value || '';
  const status  = document.getElementById('sales-filter-status')?.value  || '';

  let sales = [...(window._allSales || store.getSales())];

  if (search)  sales = sales.filter(s => s.productName.toLowerCase().includes(search) || s.clientName.toLowerCase().includes(search));
  if (payment) sales = sales.filter(s => s.paymentMethod === payment);
  if (status === 'paid')    sales = sales.filter(s => s.isPaid);
  if (status === 'pending') sales = sales.filter(s => !s.isPaid);

  const tbody = document.getElementById('sales-tbody');
  if (tbody) tbody.innerHTML = renderSalesTbody(sales);
}

// ── Add Sale Modal ────────────────────────────
function openAddSaleModal(presetProductId = null) {
  const clients  = store.getClients();
  const products = store.getProducts();

  const html = `
    <div class="modal-header">
      <span class="modal-title">🛍️ Nueva Venta</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Prenda <span class="required">*</span></label>
        <select class="form-control" id="sale-product" onchange="updateSaleVariants()">
          <option value="">— Seleccionar prenda —</option>
          ${products.map(p => `
            <option value="${esc(p.id)}" ${p.id === presetProductId ? 'selected' : ''}>${esc(p.name)} — ${fmt(p.price)}</option>
          `).join('')}
        </select>
      </div>

      <div id="sale-variant-wrap" style="display:none">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Talle <span class="required">*</span></label>
            <select class="form-control" id="sale-size" onchange="updateSaleColors()">
              <option value="">— Talle —</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Color <span class="required">*</span></label>
            <select class="form-control" id="sale-color">
              <option value="">— Color —</option>
            </select>
          </div>
        </div>
        <div id="sale-stock-info" style="font-size:.8rem;color:var(--text-muted);margin-top:-8px;margin-bottom:14px"></div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Cantidad <span class="required">*</span></label>
          <input class="form-control" id="sale-qty" type="number" min="1" value="1" onchange="updateSaleTotal()">
        </div>
        <div class="form-group">
          <label class="form-label">Precio unitario <span class="required">*</span></label>
          <div class="form-control-icon">
            <span class="icon">$</span>
            <input class="form-control" id="sale-price" type="number" min="0" placeholder="0" oninput="updateSaleTotal()">
          </div>
        </div>
      </div>

      <div id="sale-total-display" style="background:rgba(201,169,110,0.08);border:1px solid rgba(201,169,110,0.2);border-radius:var(--radius-md);padding:12px 16px;margin-bottom:14px;display:none">
        <span style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em">Total</span>
        <div style="font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;color:var(--gold)" id="sale-total-val">$0</div>
      </div>

      <div class="form-group">
        <label class="form-label">Clienta <span class="required">*</span></label>
        <select class="form-control" id="sale-client">
          <option value="">— Seleccionar clienta —</option>
          ${clients.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Medio de pago <span class="required">*</span></label>
        <select class="form-control" id="sale-payment" onchange="updateSalePaymentField()">
          <option value="Efectivo">💵 Efectivo</option>
          <option value="Transferencia">📱 Transferencia</option>
          <option value="Cuenta corriente">📋 Cuenta corriente (fiado)</option>
          <option value="Débito">💳 Débito</option>
          <option value="Crédito">💳 Crédito</option>
        </select>
      </div>

      <div id="sale-debt-note" style="background:rgba(232,201,110,0.08);border:1px solid rgba(232,201,110,0.2);border-radius:var(--radius-md);padding:12px;margin-bottom:14px;display:none;">
        <div style="font-size:.8rem;color:var(--warning);margin-bottom:8px">⚠️ Esta venta se registrará como deuda pendiente.</div>
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">¿Dejó seña o abono inicial? (Opcional)</label>
          <div class="form-control-icon">
            <span class="icon">$</span>
            <input class="form-control" id="sale-senia" type="number" min="0" placeholder="0">
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Notas</label>
        <textarea class="form-control" id="sale-notes" rows="2" placeholder="Aclaraciones, señas, etc."></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveSale()">✅ Registrar Venta</button>
    </div>
  `;

  openModal(html);

  setTimeout(() => {
    if (presetProductId) updateSaleVariants();

    window.updateSaleVariants = function() {
      const pid = document.getElementById('sale-product')?.value;
      const p = pid ? store.getProduct(pid) : null;
      const wrap = document.getElementById('sale-variant-wrap');

      if (!p) { if (wrap) wrap.style.display = 'none'; return; }
      if (wrap) wrap.style.display = '';

      // Set price
      const priceEl = document.getElementById('sale-price');
      if (priceEl) priceEl.value = p.price;
      updateSaleTotal();

      // Sizes
      const sizes = [...new Set(p.variants.map(v => v.size))];
      const sizeEl = document.getElementById('sale-size');
      if (sizeEl) {
        sizeEl.innerHTML = '<option value="">— Talle —</option>' +
          sizes.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
      }
      updateSaleColors();
    };

    window.updateSaleColors = function() {
      const pid  = document.getElementById('sale-product')?.value;
      const size = document.getElementById('sale-size')?.value;
      const p    = pid ? store.getProduct(pid) : null;
      if (!p) return;

      const colorEl = document.getElementById('sale-color');
      const stockEl = document.getElementById('sale-stock-info');

      const validVariants = size
        ? p.variants.filter(v => v.size === size)
        : p.variants;

      if (colorEl) {
        colorEl.innerHTML = '<option value="">— Color —</option>' +
          validVariants.map(v => `<option value="${esc(v.color)}" data-hex="${esc(v.colorHex)}" data-stock="${v.stock}">
            ${esc(v.color)} (Stock: ${v.stock})
          </option>`).join('');
      }

      if (stockEl) stockEl.textContent = '';
    };

    window.updateSaleTotal = function() {
      const qty   = parseFloat(document.getElementById('sale-qty')?.value)   || 0;
      const price = parseFloat(document.getElementById('sale-price')?.value) || 0;
      const total = qty * price;
      const el    = document.getElementById('sale-total-val');
      const wrap  = document.getElementById('sale-total-display');
      if (el)   el.textContent = fmt(total);
      if (wrap) wrap.style.display = total > 0 ? '' : 'none';
    };

    window.updateSalePaymentField = function() {
      const method = document.getElementById('sale-payment')?.value;
      const note   = document.getElementById('sale-debt-note');
      if (note) note.style.display = method === 'Cuenta corriente' ? '' : 'none';
    };

    window.saveSale = function() {
      const pid     = document.getElementById('sale-product')?.value;
      const size    = document.getElementById('sale-size')?.value;
      const colorEl = document.getElementById('sale-color');
      const color   = colorEl?.value;
      const colorHex = colorEl?.options[colorEl.selectedIndex]?.dataset?.hex || '#CCCCCC';
      const qty     = parseInt(document.getElementById('sale-qty')?.value) || 1;
      const price   = parseFloat(document.getElementById('sale-price')?.value) || 0;
      const cid     = document.getElementById('sale-client')?.value;
      const payment = document.getElementById('sale-payment')?.value;
      const notes   = document.getElementById('sale-notes')?.value.trim();

      if (!pid)   { toast('Seleccioná una prenda', 'error'); return; }
      if (!size)  { toast('Seleccioná el talle', 'error'); return; }
      if (!color) { toast('Seleccioná el color', 'error'); return; }
      if (!price) { toast('Ingresá el precio', 'error'); return; }
      if (!cid)   { toast('Seleccioná una clienta', 'error'); return; }

      // Check stock
      const p = store.getProduct(pid);
      const variant = p?.variants.find(v => v.size === size && v.color === color);
      if (!variant) { toast('Variante no encontrada', 'error'); return; }
      if (variant.stock < qty) { toast(`Stock insuficiente (disponible: ${variant.stock})`, 'error'); return; }

      const client = store.getClient(cid);
      const isPaid = payment !== 'Cuenta corriente';

      const saleData = {
        productId: pid,
        productName: p.name,
        variant: { size, color, colorHex },
        qty,
        price,
        clientId: cid,
        clientName: client?.name || '—',
        paymentMethod: payment,
        isPaid,
        debtId: null,
        notes,
      };

      const sale = store.addSale(saleData);

      // If account (fiado), create debt
      if (!isPaid) {
        const senia = parseFloat(document.getElementById('sale-senia')?.value) || 0;
        const payments = senia > 0 ? [{ amount: senia, date: Date.now(), note: 'Seña inicial en venta' }] : [];
        const debt = store.addDebt({
          clientId: cid,
          clientName: client?.name || '—',
          saleId: sale.id,
          description: `${p.name} (${size}, ${color})`,
          totalAmount: price * qty,
          paidAmount: senia,
          payments,
        });
        // Link debt to sale
        store.getSales(); // reload
        const s = store.getSale(sale.id);
        if (s) {
          store._data.sales.find(x => x.id === sale.id).debtId = debt.id;
          store.save();
        }
        toast('Venta registrada — Deuda creada para ' + (client?.name || ''), 'warning');
      } else {
        toast('Venta registrada ✅', 'success');
      }

      closeModal();
      renderSales();
      updateDebtBadge();
    };

    if (presetProductId) {
      const sel = document.getElementById('sale-product');
      if (sel) { sel.value = presetProductId; updateSaleVariants(); }
    }
  }, 100);
}

// ── Delete Sale ───────────────────────────────
async function deleteSaleConfirm(id) {
  const s = store.getSale(id);
  if (!s) return;
  const ok = await confirm(`¿Eliminar la venta de "${s.productName}"? Se restaurará el stock.`,
    { title: 'Eliminar Venta', icon: '🗑️', danger: true });
  if (!ok) return;
  store.deleteSale(id);
  toast('Venta eliminada — stock restaurado', 'success');
  renderSales();
  updateDebtBadge();
}
