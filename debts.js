/* ============================================
   DYGIndumentaria — Debts Page (Mobile First v4)
   ============================================ */

function renderDebts() {
  const page = document.getElementById('page-debts');
  if (!page) return;

  const allDebts    = store.getDebts();
  const activeDebts = allDebts.filter(d => !d.isPaid);
  const paidDebts   = allDebts.filter(d => d.isPaid);
  const totalPending = store.getTotalDebt();

  page.innerHTML = `
    <div>

      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:16px">
        <div>
          <h2 style="font-size:1.4rem;margin:0">Deudas & Cuentas</h2>
          <p style="font-size:.8rem;margin:0;color:var(--text-muted)">Gestión de cuentas corrientes</p>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="renderDebts()">🔄</button>
          <button class="btn btn-primary btn-sm" onclick="openAddDebtModal()">➕ Nueva</button>
        </div>
      </div>

      <!-- Banner totales -->
      <div style="background:var(--bg-card);border:1px solid var(--border-light);border-radius:14px;padding:16px;margin-bottom:14px">
        <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--danger);margin-bottom:4px">⚠️ Total pendiente</div>
        <div id="debts-total-val" style="font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:700;color:var(--text-primary);margin-bottom:14px">${fmt(0)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;border-top:1px solid var(--border-light);padding-top:12px">
          <div style="text-align:center">
            <div style="font-size:1.4rem;font-weight:700;color:var(--text-primary)">${activeDebts.length}</div>
            <div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase">Activas</div>
          </div>
          <div style="text-align:center;border-left:1px solid var(--border-light);border-right:1px solid var(--border-light)">
            <div style="font-size:1.4rem;font-weight:700;color:var(--success)">${paidDebts.length}</div>
            <div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase">Canceladas</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:1.4rem;font-weight:700;color:var(--rose-gold)">${allDebts.length}</div>
            <div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase">Total</div>
          </div>
        </div>
      </div>

      <!-- Tabs scrolleables -->
      <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:14px;scrollbar-width:none;-webkit-overflow-scrolling:touch">
        <button class="tab-btn active" id="tab-active" onclick="switchDebtTab('active',this)" style="flex-shrink:0;white-space:nowrap;font-size:.8rem;padding:7px 14px">⏳ Pendientes (${activeDebts.length})</button>
        <button class="tab-btn" id="tab-paid" onclick="switchDebtTab('paid',this)" style="flex-shrink:0;white-space:nowrap;font-size:.8rem;padding:7px 14px">✅ Canceladas (${paidDebts.length})</button>
        <button class="tab-btn" id="tab-all" onclick="switchDebtTab('all',this)" style="flex-shrink:0;white-space:nowrap;font-size:.8rem;padding:7px 14px">📋 Todas (${allDebts.length})</button>
      </div>

      <div id="debts-list">
        ${renderDebtsListHTML(activeDebts)}
      </div>
    </div>
  `;

  setTimeout(() => {
    const el = document.getElementById('debts-total-val');
    if (el) animateCount(el, totalPending, 800, '$');
  }, 200);

  window._debtsByTab = { active: activeDebts, paid: paidDebts, all: allDebts };
  window.switchDebtTab = function(tab, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const list = document.getElementById('debts-list');
    if (list) list.innerHTML = renderDebtsListHTML(window._debtsByTab[tab] || []);
  };
}

function renderDebtsListHTML(debts) {
  if (!debts.length) return `
    <div style="text-align:center;padding:40px 20px;color:var(--text-muted)">
      <div style="font-size:2.5rem;margin-bottom:10px">🎉</div>
      <div style="font-weight:600;color:var(--text-primary)">Sin deudas aquí</div>
      <div style="font-size:.85rem;margin-top:4px">¡Todo está al día!</div>
    </div>
  `;

  return debts.map((d, i) => {
    const remaining   = d.totalAmount - d.paidAmount;
    const pct         = Math.round((d.paidAmount / d.totalAmount) * 100);
    const age         = Math.floor((Date.now() - d.createdAt) / 86400000);
    const dotColor    = age < 7 ? 'var(--success)' : age < 30 ? 'var(--warning)' : 'var(--danger)';

    return `
      <div style="background:var(--bg-card);border:1px solid var(--border-light);border-radius:14px;padding:14px;margin-bottom:10px;box-shadow:var(--shadow-sm)">

        <!-- Fila 1: avatar + nombre + monto -->
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="position:relative;flex-shrink:0">
            ${avatarHTML(d.clientName, null, 'md')}
            <div style="position:absolute;top:1px;right:1px;width:8px;height:8px;border-radius:50%;background:${dotColor};border:2px solid var(--bg-card)"></div>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(d.clientName)}</div>
            <div style="font-size:.75rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(d.description)}</div>
          </div>
          <div style="flex-shrink:0;text-align:right;min-width:80px">
            <div style="font-weight:700;font-size:1rem;color:${d.isPaid ? 'var(--success)' : 'var(--danger)'}">${fmt(remaining)}</div>
            <div style="font-size:.68rem;color:var(--text-muted)">de ${fmt(d.totalAmount)}</div>
          </div>
        </div>

        <!-- Fila 2: progreso -->
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--text-muted);margin-bottom:4px">
            <span>Pagado ${fmt(d.paidAmount)} · hace ${age}d</span>
            <span>${pct}%</span>
          </div>
          <div style="height:4px;background:var(--border-light);border-radius:99px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${d.isPaid ? 'var(--success)' : 'var(--rose-gold)'};border-radius:99px;transition:width .4s"></div>
          </div>
          ${d.payments.length > 0 ? `<div style="font-size:.68rem;color:var(--text-muted);margin-top:4px">${d.payments.length} pago${d.payments.length!==1?'s':''} registrado${d.payments.length!==1?'s':''}</div>` : ''}
        </div>

        <!-- Fila 3: acciones -->
        <div style="display:flex;gap:6px;padding-top:10px;border-top:1px solid var(--border-light);flex-wrap:wrap">
          ${!d.isPaid ? `
            <button class="btn btn-success btn-sm" onclick="openPaymentModal('${esc(d.id)}')">💳 Pago</button>
            <button class="btn btn-primary btn-sm" onclick="markDebtFullyPaid('${esc(d.id)}')">✅ Cancelar</button>
          ` : `<span class="badge badge-success">✓ Cancelada</span>`}
          <button class="btn btn-ghost btn-sm" onclick="openDebtHistory('${esc(d.id)}')">📋</button>
          <button class="btn btn-danger btn-sm" onclick="deleteDebtConfirm('${esc(d.id)}')">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function openPaymentModal(debtId) {
  const d = store.getDebt(debtId);
  if (!d) return;
  const remaining = d.totalAmount - d.paidAmount;
  const pct = Math.round((d.paidAmount / d.totalAmount) * 100);
  const q1 = Math.round(remaining * 0.25);
  const q2 = Math.round(remaining * 0.5);
  const q3 = Math.round(remaining * 0.75);

  const html = `
    <div class="modal-header">
      <span class="modal-title">💳 Registrar Pago</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div style="background:var(--bg-dark);border-radius:12px;padding:14px;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          ${avatarHTML(d.clientName, null, 'md')}
          <div>
            <div style="font-weight:600">${esc(d.clientName)}</div>
            <div style="font-size:.78rem;color:var(--text-muted)">${esc(d.description)}</div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.75rem;color:var(--text-muted);margin-bottom:5px">
          <span>Pagado ${pct}%</span><span>${fmt(d.paidAmount)} de ${fmt(d.totalAmount)}</span>
        </div>
        <div style="height:4px;background:var(--border-light);border-radius:99px;overflow:hidden;margin-bottom:8px">
          <div style="height:100%;width:${pct}%;background:var(--rose-gold);border-radius:99px"></div>
        </div>
        <div style="text-align:right;font-size:.85rem">Pendiente: <strong style="color:var(--danger)">${fmt(remaining)}</strong></div>
      </div>

      <div class="form-group">
        <label class="form-label">Pagos rápidos</label>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('pay-amount').value=${q1}">25%</button>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('pay-amount').value=${q2}">50%</button>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('pay-amount').value=${q3}">75%</button>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('pay-amount').value=${remaining}">Todo</button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Monto <span class="required">*</span></label>
        <div class="form-control-icon">
          <span class="icon">$</span>
          <input class="form-control" id="pay-amount" type="number" min="1" max="${remaining}" placeholder="0">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Método</label>
        <select class="form-control" id="pay-method">
          <option>Efectivo</option><option>Transferencia</option><option>Débito</option><option>Crédito</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Nota (opcional)</label>
        <input class="form-control" id="pay-note" placeholder="Ej: Abono parcial">
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-success" onclick="savePayment('${esc(d.id)}')">💳 Registrar</button>
    </div>
  `;

  openModal(html, { size: 'sm' });

  window.savePayment = function(did) {
    const amount = parseFloat(document.getElementById('pay-amount')?.value) || 0;
    const method = document.getElementById('pay-method')?.value || 'Efectivo';
    const note   = document.getElementById('pay-note')?.value.trim() || method;
    const debt   = store.getDebt(did);
    if (!amount || amount <= 0) { toast('Ingresá un monto válido', 'error'); return; }
    if (amount > (debt.totalAmount - debt.paidAmount)) { toast('El monto supera la deuda', 'error'); return; }
    const updated = store.registerPayment(did, amount, note);
    if (!updated) { toast('Error al registrar pago', 'error'); return; }
    updated.isPaid
      ? toast(`🎉 ¡${esc(updated.clientName)} canceló su deuda!`, 'success')
      : toast(`✅ Pago de ${fmt(amount)} registrado`, 'success');
    closeModal(); renderDebts(); updateDebtBadge();
  };
}

async function markDebtFullyPaid(debtId) {
  const d = store.getDebt(debtId);
  if (!d) return;
  const remaining = d.totalAmount - d.paidAmount;
  const ok = await confirm(`¿Cancelar deuda de ${d.clientName}? Se registrará ${fmt(remaining)}.`,
    { title: 'Cancelar Deuda', icon: '✅', danger: false });
  if (!ok) return;
  store.registerPayment(debtId, remaining, 'Cancelación completa');
  toast(`Deuda de ${esc(d.clientName)} cancelada 🎉`, 'success');
  renderDebts(); updateDebtBadge();
}

function openDebtHistory(debtId) {
  const d = store.getDebt(debtId);
  if (!d) return;
  const html = `
    <div class="modal-header">
      <span class="modal-title">📋 Historial de Pagos</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div style="margin-bottom:14px">
        <div style="font-weight:600">${esc(d.clientName)}</div>
        <div style="font-size:.8rem;color:var(--text-muted)">${esc(d.description)}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
        <div style="background:var(--bg-dark);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:.6rem;color:var(--text-muted);text-transform:uppercase">Total</div>
          <div style="font-weight:700;font-size:.9rem">${fmt(d.totalAmount)}</div>
        </div>
        <div style="background:var(--bg-dark);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:.6rem;color:var(--text-muted);text-transform:uppercase">Pagado</div>
          <div style="font-weight:700;font-size:.9rem;color:var(--success)">${fmt(d.paidAmount)}</div>
        </div>
        <div style="background:var(--bg-dark);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:.6rem;color:var(--text-muted);text-transform:uppercase">Resta</div>
          <div style="font-weight:700;font-size:.9rem;color:${d.isPaid?'var(--success)':'var(--danger)'}">${fmt(d.totalAmount-d.paidAmount)}</div>
        </div>
      </div>
      ${d.payments.length === 0
        ? `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:.85rem">Sin pagos registrados aún</div>`
        : d.payments.map(p => `
          <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-light)">
            <span style="font-size:1.1rem">💳</span>
            <div style="flex:1">
              <div style="font-size:.85rem;font-weight:500">${esc(p.note || 'Pago registrado')}</div>
              <div style="font-size:.72rem;color:var(--text-muted)">${fmtDate(p.date, 'long')}</div>
            </div>
            <div style="font-weight:700;color:var(--success)">${fmt(p.amount)}</div>
            <button class="btn btn-ghost btn-sm" onclick="sharePaymentWA('${esc(d.clientId)}','${esc(d.id)}',${p.amount})">📱</button>
          </div>
        `).join('')
      }
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
      ${!d.isPaid ? `<button class="btn btn-success" onclick="closeModal();openPaymentModal('${esc(d.id)}')">💳 Nuevo Pago</button>` : ''}
    </div>
  `;
  openModal(html, { size: 'sm' });
}

function openAddDebtModal() {
  const clients = store.getClients();
  const html = `
    <div class="modal-header">
      <span class="modal-title">➕ Nueva Deuda</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div style="background:rgba(232,201,110,0.08);border:1px solid rgba(232,201,110,0.2);border-radius:10px;padding:10px;margin-bottom:14px;font-size:.78rem;color:var(--warning)">
        💡 Las deudas también se crean automáticamente con ventas en "Cuenta corriente".
      </div>
      <div class="form-group">
        <label class="form-label">Clienta <span class="required">*</span></label>
        <select class="form-control" id="md-client">
          <option value="">— Seleccionar —</option>
          ${clients.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Descripción <span class="required">*</span></label>
        <input class="form-control" id="md-desc" placeholder="Ej: Vestido rojo talle M">
      </div>
      <div class="form-group">
        <label class="form-label">Monto total <span class="required">*</span></label>
        <div class="form-control-icon">
          <span class="icon">$</span>
          <input class="form-control" id="md-amount" type="number" min="1" placeholder="0">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Seña inicial (opcional)</label>
        <div class="form-control-icon">
          <span class="icon">$</span>
          <input class="form-control" id="md-senia" type="number" min="0" placeholder="0" value="0">
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveManualDebt()">➕ Crear Deuda</button>
    </div>
  `;
  openModal(html, { size: 'sm' });

  window.saveManualDebt = function() {
    const cid    = document.getElementById('md-client')?.value;
    const desc   = document.getElementById('md-desc')?.value.trim();
    const amount = parseFloat(document.getElementById('md-amount')?.value) || 0;
    const senia  = parseFloat(document.getElementById('md-senia')?.value) || 0;
    if (!cid)    { toast('Seleccioná una clienta', 'error'); return; }
    if (!desc)   { toast('Ingresá una descripción', 'error'); return; }
    if (!amount) { toast('Ingresá el monto total', 'error'); return; }
    const client = store.getClient(cid);
    const payments = senia > 0 ? [{ amount: senia, date: Date.now(), note: 'Seña inicial' }] : [];
    store.addDebt({ clientId: cid, clientName: client?.name || '—', saleId: null, description: desc, totalAmount: amount, paidAmount: senia, payments });
    toast('Deuda creada ✅', 'success');
    closeModal(); renderDebts(); updateDebtBadge();
  };
}

async function deleteDebtConfirm(id) {
  const d = store.getDebt(id);
  if (!d) return;
  const ok = await confirm(`¿Eliminar la deuda de "${d.clientName}"?`, { title: 'Eliminar Deuda', icon: '🗑️', danger: true });
  if (!ok) return;
  store.deleteDebt(id);
  toast('Deuda eliminada', 'success');
  renderDebts(); updateDebtBadge();
}
