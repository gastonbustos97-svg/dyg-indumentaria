/* ============================================
   DYGIndumentaria — Clients Page
   ============================================ */

function renderClients() {
  const page    = document.getElementById('page-clients');
  if (!page) return;

  const clients = store.getClients();

  page.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>Clientas</h2>
        <p>${clients.length} clienta${clients.length !== 1 ? 's' : ''} registradas</p>
      </div>
      <div class="page-header-actions">
        <div class="form-control-icon" style="max-width:220px">
          <span class="icon">🔍</span>
          <input class="form-control" id="clients-search" placeholder="Buscar clienta..."
                 oninput="filterClientsGrid(this.value)">
        </div>
        <button class="btn btn-primary" onclick="openAddClientModal()">👩 Nueva Clienta</button>
      </div>
    </div>

    <div class="clients-grid" id="clients-grid">
      ${renderClientsGridHTML(clients)}
    </div>
  `;
}

function renderClientsGridHTML(clients) {
  if (!clients.length) return `
    <div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">👩</div>
      <div class="empty-state-title">Sin clientas</div>
      <div class="empty-state-desc">Agregá tu primera clienta</div>
      <button class="btn btn-primary" style="margin-top:12px" onclick="openAddClientModal()">+ Nueva Clienta</button>
    </div>
  `;

  return clients.map((c, i) => {
    const clientSales = store.getClientSales(c.id);
    const clientDebts = store.getClientDebts(c.id).filter(d => !d.isPaid);
    const totalSpent  = clientSales.filter(s => s.isPaid).reduce((sum, s) => sum + s.price * (s.qty||1), 0);
    const totalDebt   = clientDebts.reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);

    return `
      <div class="client-card animate-fade-in-up" style="animation-delay:${i*0.05}s"
           onclick="openClientDetail('${esc(c.id)}')">
        <div class="client-card-header">
          ${avatarHTML(c.name, c.photo, 'lg')}
          <div class="client-card-info">
            <div class="client-card-name">${esc(c.name)}</div>
            <div class="client-card-phone">${c.phone ? '📞 ' + esc(c.phone) : 'Sin teléfono'}</div>
            <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
              ${clientDebts.length > 0
                ? `<span class="badge badge-danger">⚠️ Debe ${fmt(totalDebt)}</span>`
                : `<span class="badge badge-success">✓ Sin deudas</span>`
              }
            </div>
          </div>
        </div>
        <div class="client-card-stats">
          <div class="client-stat">
            <div class="client-stat-value">${clientSales.length}</div>
            <div class="client-stat-label">Compras</div>
          </div>
          <div class="client-stat">
            <div class="client-stat-value" style="font-size:.85rem">${fmt(totalSpent)}</div>
            <div class="client-stat-label">Gastado</div>
          </div>
          <div class="client-stat">
            <div class="client-stat-value" style="color:${totalDebt>0?'var(--danger)':'var(--success)'}">
              ${totalDebt > 0 ? fmt(totalDebt) : '—'}
            </div>
            <div class="client-stat-label">Deuda</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterClientsGrid(search) {
  const q = search.toLowerCase();
  const clients = store.getClients().filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.phone || '').includes(q) ||
    (c.email || '').toLowerCase().includes(q)
  );
  const grid = document.getElementById('clients-grid');
  if (grid) grid.innerHTML = renderClientsGridHTML(clients);
}

// ── Client Detail Modal ───────────────────────
function openClientDetail(clientId) {
  const c = store.getClient(clientId);
  if (!c) return;

  const clientSales = store.getClientSales(c.id);
  const clientDebts = store.getClientDebts(c.id);
  const activeDebts = clientDebts.filter(d => !d.isPaid);
  const totalSpent  = clientSales.filter(s => s.isPaid).reduce((sum, s) => sum + s.price * (s.qty||1), 0);
  const totalDebt   = activeDebts.reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);

  const html = `
    <div class="modal-header">
      <span class="modal-title">Ficha de Clienta</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <!-- Header -->
      <div class="client-detail-header">
        ${avatarHTML(c.name, c.photo, 'xl')}
        <div>
          <div class="client-detail-name">${esc(c.name)}</div>
          <div class="client-detail-meta">
            ${c.phone ? `<span>📞 ${esc(c.phone)}</span>` : ''}
            ${c.email ? `<span>✉️ ${esc(c.email)}</span>` : ''}
          </div>
          ${c.address ? `<div style="font-size:.8rem;color:var(--text-muted);margin-top:4px">📍 ${esc(c.address)}</div>` : ''}
          ${c.notes   ? `<div style="font-size:.8rem;color:var(--text-muted);margin-top:4px;font-style:italic">"${esc(c.notes)}"</div>` : ''}
        </div>
      </div>

      <!-- Stats row -->
      <div class="stats-grid" style="margin-bottom:20px;grid-template-columns:repeat(3,1fr)">
        <div style="background:var(--bg-dark);border-radius:var(--radius-md);padding:14px;text-align:center">
          <div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Compras</div>
          <div style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700">${clientSales.length}</div>
        </div>
        <div style="background:var(--bg-dark);border-radius:var(--radius-md);padding:14px;text-align:center">
          <div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Total gastado</div>
          <div style="font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;color:var(--gold)">${fmt(totalSpent)}</div>
        </div>
        <div style="background:var(--bg-dark);border-radius:var(--radius-md);padding:14px;text-align:center">
          <div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Deuda activa</div>
          <div style="font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;color:${totalDebt>0?'var(--danger)':'var(--success)'}">
            ${totalDebt > 0 ? fmt(totalDebt) : '¡Al día!'}
          </div>
        </div>
      </div>

      <!-- Active debts -->
      ${activeDebts.length > 0 ? `
        <div class="divider-label">⚠️ Deudas Pendientes</div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
          ${activeDebts.map(d => `
            <div class="debt-card" style="flex-wrap:wrap">
              <div class="debt-card-info">
                <div class="debt-card-client">${esc(d.description)}</div>
                <div class="debt-card-detail">
                  Desde ${fmtDate(d.createdAt, 'relative')} ·
                  Pagado: ${fmt(d.paidAmount)} / ${fmt(d.totalAmount)}
                </div>
                <div class="progress-wrap" style="margin-top:8px">
                  <div class="progress-fill" style="width:${Math.round(d.paidAmount/d.totalAmount*100)}%"></div>
                </div>
              </div>
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
                <div class="debt-card-amount">${fmt(d.totalAmount - d.paidAmount)}</div>
                <button class="btn btn-success btn-sm" onclick="closeModal();navigate('debts');openPaymentModal('${esc(d.id)}')">
                  💳 Registrar Pago
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Purchase history -->
      <div class="divider-label">Historial de Compras</div>
      ${clientSales.length === 0
        ? `<div class="empty-state" style="padding:24px"><div class="empty-state-icon">🛍️</div><div class="empty-state-title">Sin compras</div></div>`
        : `<div class="table-wrap">
            <table class="table">
              <thead><tr><th>Prenda</th><th>Variante</th><th>Total</th><th>Medio</th><th>Fecha</th><th></th></tr></thead>
              <tbody>
                ${clientSales.map(s => `
                  <tr>
                    <td style="font-weight:500;color:var(--text-primary)">${esc(s.productName)}</td>
                    <td style="font-size:.8rem">
                      ${s.variant ? `<div style="display:flex;align-items:center;gap:5px">${colorDotHTML(s.variant.colorHex)}${esc(s.variant.size)} · ${esc(s.variant.color)}</div>` : '—'}
                    </td>
                    <td style="font-weight:700;color:var(--gold)">${fmt(s.price*(s.qty||1))}</td>
                    <td>${paymentBadge(s.paymentMethod)}</td>
                    <td style="font-size:.8rem;color:var(--text-muted)">${fmtDate(s.date, 'short')}</td>
                    <td><button class="btn btn-ghost btn-sm" onclick="shareSaleWA('${esc(s.clientId)}', '${esc(s.id)}')">📱</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`
      }
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
      <button class="btn btn-secondary" onclick="closeModal();openEditClientModal('${esc(c.id)}')">✏️ Editar</button>
      <button class="btn btn-primary" onclick="closeModal();navigate('sales');openAddSaleModal()">🛍️ Nueva Venta</button>
    </div>
  `;

  openModal(html, { size: 'lg' });
}

// ── Add / Edit Client Modal ───────────────────
function openAddClientModal()    { openClientForm(null); }
function openEditClientModal(id) { openClientForm(id); }

function openClientForm(clientId) {
  const c      = clientId ? store.getClient(clientId) : null;
  const isEdit = !!c;

  const html = `
    <div class="modal-header">
      <span class="modal-title">${isEdit ? '✏️ Editar Clienta' : '👩 Nueva Clienta'}</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <!-- Avatar upload -->
      <div style="display:flex;justify-content:center;margin-bottom:20px">
        <div style="position:relative;cursor:pointer" onclick="document.getElementById('client-photo-input').click()">
          <div id="client-avatar-preview" class="avatar avatar-xl">
            ${c?.photo ? `<img src="${c.photo}" alt="">` : esc(initials(c?.name || '?'))}
          </div>
          <div style="position:absolute;bottom:0;right:0;width:26px;height:26px;background:var(--gold);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.8rem;border:2px solid var(--bg-card)">
            📷
          </div>
          <input type="file" id="client-photo-input" accept="image/*" style="display:none">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nombre <span class="required">*</span></label>
          <input class="form-control" id="c-name" placeholder="Nombre completo" value="${esc(c?.name||'')}">
        </div>
        <div class="form-group">
          <label class="form-label">Teléfono</label>
          <input class="form-control" id="c-phone" placeholder="11 1234-5678" value="${esc(c?.phone||'')}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-control" id="c-email" type="email" placeholder="correo@ejemplo.com" value="${esc(c?.email||'')}">
        </div>
        <div class="form-group">
          <label class="form-label">Dirección</label>
          <input class="form-control" id="c-address" placeholder="Barrio / Ciudad" value="${esc(c?.address||'')}">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Notas</label>
        <textarea class="form-control" id="c-notes" rows="2" placeholder="Talles preferidos, preferencias, etc.">${esc(c?.notes||'')}</textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      ${isEdit ? `<button class="btn btn-danger btn-sm" onclick="deleteClientConfirm('${esc(c.id)}')">🗑️ Eliminar</button>` : ''}
      <button class="btn btn-primary" onclick="saveClient('${esc(clientId||'')}')">
        ${isEdit ? '💾 Guardar' : '👩 Agregar'}
      </button>
    </div>
  `;

  openModal(html);

  setTimeout(() => {
    let clientPhoto = c?.photo || null;

    const photoInput = document.getElementById('client-photo-input');
    if (photoInput) {
      photoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        clientPhoto = await fileToBase64(file);
        const preview = document.getElementById('client-avatar-preview');
        if (preview) preview.innerHTML = `<img src="${clientPhoto}" alt="">`;
      });
    }

    window.saveClient = function(cid) {
      const name    = document.getElementById('c-name')?.value.trim();
      const phone   = document.getElementById('c-phone')?.value.trim();
      const email   = document.getElementById('c-email')?.value.trim();
      const address = document.getElementById('c-address')?.value.trim();
      const notes   = document.getElementById('c-notes')?.value.trim();

      if (!name) { toast('El nombre es requerido', 'error'); return; }

      const data = { name, phone, email, address, notes, photo: clientPhoto };

      if (cid) {
        store.updateClient(cid, data);
        toast('Clienta actualizada ✨', 'success');
      } else {
        store.addClient(data);
        toast('Clienta agregada 🎉', 'success');
      }

      closeModal();
      renderClients();
    };
  }, 100);
}

// ── Delete Client ─────────────────────────────
async function deleteClientConfirm(id) {
  const c = store.getClient(id);
  if (!c) return;
  const ok = await confirm(`¿Eliminar a "${c.name}"? Sus ventas y deudas quedarán registradas.`,
    { title: 'Eliminar Clienta', icon: '🗑️', danger: true });
  if (!ok) return;
  store.deleteClient(id);
  toast('Clienta eliminada', 'success');
  closeModal();
  renderClients();
}
