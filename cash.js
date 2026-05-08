/* ============================================
   DYGIndumentaria — Cash Register (Caja)
   ============================================ */

function renderCash() {
  const page = document.getElementById('page-cash');
  if (!page) return;

  const today = new Date();
  today.setHours(0,0,0,0);
  const endOfDay = today.getTime() + 86400000;

  // 1. Ingresos por ventas de HOY
  const sales = store.getSales().filter(s => s.date >= today.getTime() && s.date < endOfDay && s.paymentMethod !== 'Cuenta corriente');
  const salesTotal = sales.reduce((sum, s) => sum + s.price * (s.qty || 1), 0);

  // 2. Ingresos por pagos de deuda de HOY
  const debtPayments = store.getDebts().reduce((sum, d) => {
    return sum + (d.payments || [])
      .filter(p => p.date >= today.getTime() && p.date < endOfDay)
      .reduce((s, p) => s + Number(p.amount), 0);
  }, 0);

  const autoIncome = salesTotal + debtPayments;

  // 3. Movimientos manuales de HOY
  let manualMovements = store.getCashMovements();
  const manualToday = manualMovements.filter(m => m.createdAt >= today.getTime() && m.createdAt < endOfDay);
  const manualIncome = manualToday.filter(m => m.type === 'income').reduce((sum, m) => sum + Number(m.amount), 0);
  const manualExpense = manualToday.filter(m => m.type === 'expense').reduce((sum, m) => sum + Number(m.amount), 0);

  const expectedCash = autoIncome + manualIncome - manualExpense;

  page.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>Caja Diaria</h2>
        <p>Control de ingresos y gastos del día</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-danger" onclick="openAddMovementModal('expense')">➖ Registrar Gasto</button>
        <button class="btn btn-success" onclick="openAddMovementModal('income')">➕ Ingreso Extra</button>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 24px;">
      <div class="stat-card animate-fade-in-up" style="animation-delay: 0s;">
        <div class="stat-icon" style="background:var(--success-dim);color:var(--success)">💵</div>
        <div class="stat-value">${fmt(autoIncome)}</div>
        <div class="stat-label">Ventas y Pagos Hoy</div>
      </div>
      <div class="stat-card animate-fade-in-up" style="animation-delay: 0.1s;">
        <div class="stat-icon" style="background:var(--danger-dim);color:var(--danger)">📉</div>
        <div class="stat-value" style="color:var(--danger)">- ${fmt(manualExpense)}</div>
        <div class="stat-label">Gastos Registrados</div>
      </div>
      <div class="stat-card animate-fade-in-up" style="animation-delay: 0.2s; background: var(--bg-dark); border: 1px solid var(--gold);">
        <div class="stat-icon" style="background:var(--rose-gold-dim);color:var(--gold)">💰</div>
        <div class="stat-value" style="color:var(--gold)">${fmt(expectedCash)}</div>
        <div class="stat-label" style="font-weight:600">Efectivo Esperado en Caja</div>
      </div>
    </div>

    <div class="divider-label">Historial de Movimientos Manuales</div>
    ${manualMovements.length === 0 
      ? `<div class="empty-state"><div class="empty-state-icon">📝</div><div class="empty-state-title">Sin movimientos manuales</div></div>`
      : `<div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${manualMovements.map(m => `
                <tr>
                  <td>${m.type === 'income' ? '<span class="badge badge-success">Ingreso</span>' : '<span class="badge badge-danger">Gasto</span>'}</td>
                  <td>${esc(m.description)}</td>
                  <td style="font-weight:700; color: ${m.type === 'income' ? 'var(--success)' : 'var(--danger)'}">
                    ${m.type === 'income' ? '+' : '-'}${fmt(m.amount)}
                  </td>
                  <td style="font-size:.8rem;color:var(--text-muted)">${fmtDate(m.createdAt, 'short')}</td>
                  <td>
                    <button class="btn btn-ghost btn-sm" onclick="deleteMovementConfirm('${esc(m.id)}')">🗑️</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`
    }
  `;
}

function openAddMovementModal(type) {
  const isIncome = type === 'income';
  const html = `
    <div class="modal-header">
      <span class="modal-title">${isIncome ? '➕ Nuevo Ingreso Extra' : '➖ Registrar Gasto'}</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Descripción <span class="required">*</span></label>
        <input class="form-control" id="mov-desc" placeholder="${isIncome ? 'Ej: Vuelto inicial, Cambio' : 'Ej: Bolsas, Limpieza, Envío'}">
      </div>
      <div class="form-group">
        <label class="form-label">Monto <span class="required">*</span></label>
        <div class="form-control-icon">
          <span class="icon">$</span>
          <input class="form-control" id="mov-amount" type="number" min="1" placeholder="0">
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn ${isIncome ? 'btn-success' : 'btn-danger'}" onclick="saveMovement('${type}')">
        ${isIncome ? 'Guardar Ingreso' : 'Guardar Gasto'}
      </button>
    </div>
  `;
  openModal(html, { size: 'sm' });
}

window.saveMovement = function(type) {
  const desc = document.getElementById('mov-desc')?.value.trim();
  const amount = parseFloat(document.getElementById('mov-amount')?.value) || 0;

  if (!desc) { toast('Ingresá una descripción', 'error'); return; }
  if (amount <= 0) { toast('Ingresá un monto válido', 'error'); return; }

  store.addCashMovement({ type, description: desc, amount });
  toast('Movimiento registrado ✅', 'success');
  closeModal();
  renderCash();
};

window.deleteMovementConfirm = async function(id) {
  const ok = await confirm('¿Eliminar este movimiento de caja?', { title: 'Eliminar', icon: '🗑️', danger: true });
  if (ok) {
    store.deleteCashMovement(id);
    toast('Movimiento eliminado', 'success');
    renderCash();
  }
};
