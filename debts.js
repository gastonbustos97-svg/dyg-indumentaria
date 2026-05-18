/* ============================================
   DYGIndumentaria — Debts Page (Mobile Fixed)
   ============================================ */

function renderDebts() {
  const page  = document.getElementById('page-debts');
  if (!page) return;

  const allDebts     = store.getDebts();
  const activeDebts  = allDebts.filter(d => !d.isPaid);
  const paidDebts    = allDebts.filter(d => d.isPaid);
  const totalPending = store.getTotalDebt();

  page.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>Deudas & Cuentas</h2>
        <p>Gestión de cuentas corrientes y pagos</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary btn-sm" onclick="renderDebts()">🔄 Actualizar</button>
        <button class="btn btn-primary" onclick="openAddDebtModal()">➕ Nueva Deuda</button>
      </div>
    </div>

    <div style="background:var(--bg-card);border:1px solid var(--border-light);border-radius:14px;padding:16px;margin-bottom:16px">
      <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--danger);margin-bottom:6px">⚠️ Total Pendiente</div>
      <div id="debts-total-val" style="font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:700;color:var(--text-primary);margin-bottom:12px">${fmt(0)}</div>
      <div style="display:flex;gap:0;border-top:1px solid var(--border-light);padding-top:12px">
        <div style="flex:1;text-align:center">
          <div style="font-size:1.3rem;font-weight:700;color:var(--text-primary)">${activeDebts.length}</div>
          <div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase">Activas</div>
        </div>
        <div style="flex:1;text-align:center;border-left:1px solid var(--border-light)">
          <div style="font-size:1.3rem;font-weight:700;color:var(--success)">${paidDebts.length}</div>
          <div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase">Canceladas</div>
        </div>
        <div style="flex:1;text-align:center;border-left:1px solid var(--border-light)">
          <div style="font-size:1.3rem;font-weight:700;color:var(--rose-gold)">${allDebts.length}</div>
          <div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase">Total</div>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:14px;-webkit-overflow-scrolling:touch">
      <button class="tab-btn active" id="tab-active" onclick="switchDebtTab('active',this)" style="white-space:nowrap;flex-shrink:0;font-size:.82rem">⏳ Pendientes (${activeDebts.length})</button>
      <button class="tab-btn" id="tab-paid" onclick="switchDebtTab('paid',this)" style="white-space:nowrap;flex-shrink:0;font-size:.82rem">✅ Canceladas (${paidDebts.length})</button>
      <button class="tab-btn" id="tab-all" onclick="switchDebtTab('all',this)" style="white-space:nowrap;flex-shrink:0;font-size:.82rem">📋 Todas (${allDebts.length})</button>
    </div>

    <div id="debts-list">
      ${renderDebtsListHTML(activeDebts)}
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
    <div class="empty-state">
      <div class="empty-state-icon">🎉</div>
      <div class="empty-state-title">Sin deudas aquí</div>
      <div class="empty-state-desc">¡Todo está al día!</div>
    </div>
  `;

  return debts.map((d, i) => {
    const remaining   = d.totalAmount - d.paidAmount;
    const pct         = Math.round((d.paidAmount / d.totalAmount) * 100);
    const age         = Math.floor((Date.now() - d.createdAt) / 86400000);
    const ageColor    = age < 7 ? 'var(--success)' : age < 30 ? 'var(--warning)' : 'var(--danger)';
    const ageLabel    = age === 0 ? 'Hoy' : age === 1 ? 'Ayer' : `Hace ${age}d`;

    return `<div class="di animate-fade-in-up" style="animation-delay:${i*0.05}s">
  <div class="di-top">
    <div style="position:relative;flex-shrink:0">
      ${avatarHTML(d.clientName, null, 'md')}
      <div style="position:absolute;top:0;right:0;width:9px;height:9px;border-radius:50%;background:${ageColor};border:2px solid var(--bg-card)"></div>
    </div>
    <div class="di-info">
      <div class="di-name">${esc(d.clientName)}</div>
      <div class="di-desc">${esc(d.description)}</div>
    </div>
    <div class="di-amount" style="color:${d.isPaid ? 'var(--success)' : 'var(--danger)'}">
      ${d.isPaid ? '✓ ' : ''}${fmt(remaining)}
    </div>
  </div>
  <div class="di-progress">
    <div class="di-bar"><div style="height:100%;width:${pct}%;background:${d.isPaid ? 'var(--success)' : 'var(--rose-gold)'};border-radius:99px"></div></div>
    <div class="di-labels"><span>${fmt(d.paidAmount)} pagado</span><span>${pct}% · ${ageLabel}</span></div>
  </div>
  <div class="di-actions">
    ${!d.isPaid ? `
      <button class="di-btn-pay" onclick="openPaymentModal('${esc(d.id)}')">💳 Registrar pago</button>
      <button class="di-icon" onclick="markDebtFullyPaid('${esc(d.id)}')">✅</button>
    ` : `<span class="badge badge-success">✓ Cancelada</span>`}
    <button class="di-icon" onclick="openDebtHistory('${esc(d.id)}')">📋</button>
    <button class="di-icon di-icon-del" onclick="deleteDebtConfirm('${esc(d.id)}')">🗑️</button>
  </div>
</div>`;
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
      <span class="modal-title">💜 Registrar Pago — Fiado</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div style="background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(232,121,160,0.05));border:1px solid rgba(139,92,246,0.2);border-radius:var(--radius-lg);padding:16px;margin-bottom:18px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          ${avatarHTML(d.clientName, null, 'md')}
          <div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:700;color:var(--text-primary)">${esc(d.clientName)}</div>
            <div style="font-size:.78rem;color:var(--text-muted);margin-top:2px">${esc(d.description)}</div>
          </div>
        </div>
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--text-muted);margin-bottom:5px">
            <span>Pagado ${pct}%</span>
            <span>${fmt(d.paidAmount)} de ${fmt(d.totalAmount)}</span>
          </div>
          <div class="progress-wrap"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>
        <div style="text-align:right">
          <span style="font-size:.75rem;color:var(--text-muted)">Pendiente: </span>
          <span style="font-weight:700;color:var(--danger);font-size:1rem">${fmt(remaining)}</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Pagos rápidos</label>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px">
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('pay-amount').value=${q1}">25% — ${fmt(q1)}</button>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('pay-amount').value=${q2}">50% — ${fmt(q2)}</button>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('pay-amount').value=${q3}">75% — ${fmt(q3)}</button>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('pay-amount').value=${remaining}">Total — ${fmt(remaining)}</button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Monto a registrar <span class="required">*</span></label>
        <div class="form-control-icon">
          <span class="icon">$</span>
          <input class="form-control" id="pay-amount" type="number" min="1" max="${remaining}" placeholder="0">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Método de pago</label>
        <select class="form-control" id="pay-method">
          <option>Efectivo</option>
          <option>Transferencia</option>
          <option>Débito</option>
          <option>Crédito</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Nota (opcional)</label>
        <input class="form-control" id="pay-note" placeholder="Ej: Abono parcial">
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-success" onclick="savePayment('${esc(d.id)}')">💳 Registrar Pago</button>
    </div>
  `;

  openModal(html, { size: 'sm' });

  window.savePayment = function(did) {
    const amount = parseFloat(document.getElementById('pay-amount')?.value) || 0;
    const method = document.getElementById('pay-method')?.value || 'Efectivo';
    const noteRaw = document.getElementById('pay-note')?.value.trim();
    const note = noteRaw || method;
    const debt = store.getDebt(did);

    if (!amount || amount <= 0) { toast('Ingresá un monto válido', 'error'); return; }
    if (amount > (debt.totalAmount - debt.paidAmount)) {
      toast('El monto supera la deuda pendiente', 'error'); return;
    }

    const updated = store.registerPayment(did, amount, note);
    if (!updated) { toast('Error al registrar pago', 'error'); return; }

    if (updated.isPaid) {
      toast(`🎉 ¡${esc(updated.clientName)} canceló su deuda!`, 'success');
    } else {
      const newPending = updated.totalAmount - updated.paidAmount;
      toast(`✅ Pago de ${fmt(amount)} registrado. Queda: ${fmt(newPending)}`, 'success');
    }

    closeModal();
    renderDebts();
    updateDebtBadge();
  };
}

async function markDebtFullyPaid(debtId) {
  const d = store.getDebt(debtId);
  if (!d) return;
  const remaining = d.totalAmount - d.paidAmount;
  const ok = await confirm(`¿Marcar la deuda de ${d.clientName} como completamente cancelada?\nSe registrará un pago de ${fmt(remaining)}.`,
    { title: 'Cancelar Deuda', icon: '✅', danger: false });
  if (!ok) return;
  store.registerPayment(debtId, remaining, 'Cancelación completa');
  toast(`Deuda de ${esc(d.clientName)} cancelada 🎉`, 'success');
  renderDebts();
  updateDebtBadge();
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
      <div style="margin-bottom:16px">
        <div style="font-family:'Cormorant Garamond',serif;font-size:1rem;font-weight:600">${esc(d.clientName)}</div>
        <div style="font-size:.8rem;color:var(--text-muted)">${esc(d.description)}</div>
      </div>
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">
        <div style="background:var(--bg-dark);border-radius:var(--radius-md);padding:12px;text-align:center">
          <div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Total</div>
          <div style="font-weight:700">${fmt(d.totalAmount)}</div>
        </div>
        <div style="background:var(--bg-dark);border-radius:var(--radius-md);padding:12px;text-align:center">
          <div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Pagado</div>
          <div style="font-weight:700;color:var(--success)">${fmt(d.paidAmount)}</div>
        </div>
        <div style="background:var(--bg-dark);border-radius:var(--radius-md);padding:12px;text-align:center">
          <div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Pendiente</div>
          <div style="font-weight:700;color:${d.isPaid ? 'var(--success)' : 'var(--danger)'}">${fmt(d.totalAmount - d.paidAmount)}</div>
        </div>
      </div>
      <div class="debt-payment-log">
        ${d.payments.length === 0
          ? `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:.85rem">Sin pagos registrados aún</div>`
          : d.payments.map(p => `
              <div class="debt-payment-item">
                <span style="font-size:1.1rem">💳</span>
                <div style="flex:1">
                  <div style="font-size:.85rem;font-weight:500;color:var(--text-primary)">${esc(p.note || 'Pago registrado')}</div>
                  <div class="debt-payment-date">${fmtDate(p.date, 'long')}</div>
                </div>
                <div class="debt-payment-amount">${fmt(p.amount)}</div>
                <button class="btn btn-ghost btn-sm" onclick="sharePaymentWA('${esc(d.clientId)}', '${esc(d.id)}', ${p.amount})" style="padding:4px;margin-left:8px">📱</button>
              </div>
            `).join('')
        }
      </div>
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
      <span class="modal-title">➕ Nueva Deuda Manual</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div style="background:rgba(232,201,110,0.08);border:1px solid rgba(232,201,110,0.2);border-radius:var(--radius-md);padding:12px;margin-bottom:16px;font-size:.8rem;color:var(--warning)">
        💡 Las deudas también se crean automáticamente al registrar una venta en "Cuenta corriente".
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
        <input class="form-control" id="md-desc" placeholder="Ej: Vestido rojo, talle M">
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

    store.addDebt({
      clientId: cid,
      clientName: client?.name || '—',
      saleId: null,
      description: desc,
      totalAmount: amount,
      paidAmount: senia,
      payments,
    });

    toast('Deuda creada ✅', 'success');
    closeModal();
    renderDebts();
    updateDebtBadge();
  };
}

async function deleteDebtConfirm(id) {
  const d = store.getDebt(id);
  if (!d) return;
  const ok = await confirm(`¿Eliminar la deuda de "${d.clientName}"? Esta acción no se puede deshacer.`,
    { title: 'Eliminar Deuda', icon: '🗑️', danger: true });
  if (!ok) return;
  store.deleteDebt(id);
  toast('Deuda eliminada', 'success');
  renderDebts();
  updateDebtBadge();
}
