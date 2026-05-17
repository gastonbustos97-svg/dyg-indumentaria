/* ============================================
   DYGIndumentaria — Utils & Helpers
   ============================================ */

// ── Currency Format ──────────────────────────
function fmt(amount) {
  const s = store.getSettings();
  return s.currency + new Intl.NumberFormat('es-AR').format(Math.round(amount));
}

// ── Date Format ──────────────────────────────
function fmtDate(ts, style = 'short') {
  const d = new Date(ts);
  if (style === 'short') {
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  if (style === 'long') {
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (style === 'relative') {
    const diff = Date.now() - ts;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7)  return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days/7)} sem.`;
    if (days < 365) return `Hace ${Math.floor(days/30)} meses`;
    return `Hace ${Math.floor(days/365)} año(s)`;
  }
  return d.toLocaleDateString('es-AR');
}

// ── ID Generator ─────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Initials from name ────────────────────────
function initials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ── Escape HTML ──────────────────────────────
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Debounce ─────────────────────────────────
function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ── Toast Notifications ──────────────────────
function toast(message, type = 'info', duration = 3500) {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: '✨' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `
    <span class="toast-icon">${icons[type] || '💬'}</span>
    <span class="toast-msg">${esc(message)}</span>
  `;
  el.addEventListener('click', () => dismissToast(el));

  const container = document.getElementById('toast-container');
  if (container) container.appendChild(el);

  setTimeout(() => dismissToast(el), duration);
}

function dismissToast(el) {
  if (!el.parentNode) return;
  el.classList.add('toast-exit');
  setTimeout(() => el.remove(), 300);
}

// ── Modal Manager ────────────────────────────
let activeModal = null;

function openModal(html, { size = '', onOpen } = {}) {
  closeModal();
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'active-modal-backdrop';

  backdrop.innerHTML = `
    <div class="modal ${size ? 'modal-' + size : ''}">
      ${html}
    </div>
  `;

  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeModal();
  });

  document.body.appendChild(backdrop);
  activeModal = backdrop;
  document.body.style.overflow = 'hidden';

  if (onOpen) setTimeout(onOpen, 50);
  return backdrop;
}

function closeModal() {
  if (!activeModal) return;
  const toRemove = activeModal;   // ← captura la referencia ANTES de sobreescribir
  activeModal = null;             // ← libera inmediatamente para evitar la race condition
  toRemove.classList.add('closing');
  document.body.style.overflow = '';
  setTimeout(() => {
    toRemove.remove();            // ← borra el modal VIEJO, nunca el nuevo
  }, 220);
}

// ── Confirm Dialog ───────────────────────────
function confirm(message, { title = '¿Estás segura?', icon = '🗑️', danger = true } = {}) {
  return new Promise(resolve => {
    const html = `
      <div class="modal-header">
        <span class="modal-title">${esc(title)}</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="confirm-dialog">
          <div class="confirm-dialog-icon">${icon}</div>
          <p class="confirm-dialog-msg">${esc(message)}</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-ok-btn">
          Confirmar
        </button>
      </div>
    `;
    const backdrop = openModal(html, { size: 'sm' });
    backdrop.querySelector('#confirm-ok-btn')?.addEventListener('click', () => {
      closeModal();
      resolve(true);
    });
  });
}

// ── Avatar render ────────────────────────────
function avatarHTML(name, photo, size = 'md', extraClass = '') {
  const init = initials(name);
  if (photo) {
    return `<div class="avatar avatar-${size} ${extraClass}"><img src="${photo}" alt="${esc(name)}"></div>`;
  }
  return `<div class="avatar avatar-${size} ${extraClass}">${esc(init)}</div>`;
}

// ── Color dot HTML ───────────────────────────
function colorDotHTML(hex, title = '') {
  return `<span class="color-dot" style="background:${esc(hex)}" title="${esc(title)}"></span>`;
}

// ── Stock badge ──────────────────────────────
function stockBadge(totalStock) {
  if (totalStock === 0) return `<span class="badge badge-danger">Sin stock</span>`;
  if (totalStock <= 3)  return `<span class="badge badge-warning">Stock bajo</span>`;
  return `<span class="badge badge-success">En stock</span>`;
}

// ── Payment method badge ─────────────────────
function paymentBadge(method) {
  const map = {
    'Efectivo':         'badge-success',
    'Transferencia':    'badge-info',
    'Cuenta corriente': 'badge-warning',
    'Débito':           'badge-neutral',
    'Crédito':          'badge-neutral',
  };
  return `<span class="badge ${map[method] || 'badge-neutral'}">${esc(method)}</span>`;
}

// ── File to base64 (with compression) ────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_size = 800;

        if (width > height) {
          if (width > max_size) {
            height = Math.round(height * (max_size / width));
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width = Math.round(width * (max_size / height));
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Number counter animation ─────────────────
function animateCount(el, target, duration = 1000, prefix = '', suffix = '') {
  const start = performance.now();
  const update = (ts) => {
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(eased * target);
    el.textContent = prefix + new Intl.NumberFormat('es-AR').format(value) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// ── Button ripple ────────────────────────────
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${e.clientX - rect.left - size/2}px;
    top: ${e.clientY - rect.top - size/2}px;
  `;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
});

// ── Expose globals ───────────────────────────
window.fmt = fmt;
window.fmtDate = fmtDate;
window.uid = uid;
window.initials = initials;
window.esc = esc;
window.debounce = debounce;
window.toast = toast;
window.openModal = openModal;
window.closeModal = closeModal;
window.confirm = confirm;
window.avatarHTML = avatarHTML;
window.colorDotHTML = colorDotHTML;
window.stockBadge = stockBadge;
window.paymentBadge = paymentBadge;
window.fileToBase64 = fileToBase64;
window.animateCount = animateCount;

function handleGlobalSearch(q) {
  if (!q.trim()) return;
  toast('Utiliza el nuevo buscador inteligente desplegable.', 'info');
}
window.handleGlobalSearch = handleGlobalSearch;

// ── Theme Toggle ─────────────────────────────
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('dyg_theme', newTheme);
}
window.toggleTheme = toggleTheme;

// ── Smart Search ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('global-search');
  const dropdown = document.getElementById('search-dropdown');

  if (searchInput && dropdown) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (q.length < 2) { dropdown.classList.remove('active'); return; }

      const clients = store.getClients().filter(c => c.name.toLowerCase().includes(q));
      const products = store.getProducts().filter(p => p.name.toLowerCase().includes(q));

      if (clients.length === 0 && products.length === 0) {
        dropdown.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:.85rem">Sin resultados para "${esc(q)}"</div>`;
      } else {
        let html = '';
        if (clients.length > 0) {
          html += `<div style="padding:6px 14px;font-size:.7rem;font-weight:700;text-transform:uppercase;color:var(--gold);background:var(--bg-dark)">Clientas</div>`;
          html += clients.slice(0,5).map(c => `
            <div class="search-result-item" onclick="document.getElementById('global-search').value=''; document.getElementById('search-dropdown').classList.remove('active'); navigate('clients'); setTimeout(()=>openClientDetail('${esc(c.id)}'), 100)">
              ${avatarHTML(c.name, c.photo, 'sm')}
              <div>
                <div class="search-result-title">${esc(c.name)}</div>
                <div class="search-result-sub">${c.phone ? '📞 ' + esc(c.phone) : 'Clienta'}</div>
              </div>
            </div>
          `).join('');
        }
        if (products.length > 0) {
          html += `<div style="padding:6px 14px;font-size:.7rem;font-weight:700;text-transform:uppercase;color:var(--gold);background:var(--bg-dark)">Prendas</div>`;
          html += products.slice(0,5).map(p => `
            <div class="search-result-item" onclick="document.getElementById('global-search').value=''; document.getElementById('search-dropdown').classList.remove('active'); navigate('catalog'); setTimeout(()=>openProductDetail('${esc(p.id)}'), 100)">
              <div style="width:32px;height:32px;border-radius:4px;overflow:hidden;background:var(--bg-dark);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${p.photos && p.photos.length ? `<img src="${p.photos[0]}" style="width:100%;height:100%;object-fit:cover">` : '👗'}
              </div>
              <div style="min-width:0">
                <div class="search-result-title" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.name)}</div>
                <div class="search-result-sub">${esc(p.category)} · ${fmt(p.price)}</div>
              </div>
            </div>
          `).join('');
        }
        dropdown.innerHTML = html;
      }
      dropdown.classList.add('active');
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.topbar-search')) {
        dropdown.classList.remove('active');
      }
    });
  }
});

// ── Mobile Search ────────────────────────────
function openMobileSearch() {
  const overlay = document.getElementById('mobile-search-overlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    document.getElementById('mobile-search-input')?.focus();
  }, 300);
}

function closeMobileSearch() {
  const overlay = document.getElementById('mobile-search-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  const input = document.getElementById('mobile-search-input');
  if (input) input.value = '';
  const results = document.getElementById('mobile-search-results');
  if (results) results.innerHTML = `
    <div class="mobile-search-hint">
      <div class="mobile-search-hint-icon">🔍</div>
      <div>Escribí para buscar clientas o prendas</div>
    </div>`;
  document.getElementById('mobile-search-clear')?.classList.remove('visible');
}

function clearMobileSearch() {
  const input = document.getElementById('mobile-search-input');
  if (input) { input.value = ''; input.focus(); }
  document.getElementById('mobile-search-clear')?.classList.remove('visible');
  const results = document.getElementById('mobile-search-results');
  if (results) results.innerHTML = `
    <div class="mobile-search-hint">
      <div class="mobile-search-hint-icon">🔍</div>
      <div>Escribí para buscar clientas o prendas</div>
    </div>`;
}

function renderMobileSearchResults(q) {
  const results = document.getElementById('mobile-search-results');
  if (!results) return;

  const clients  = store.getClients().filter(c => c.name.toLowerCase().includes(q));
  const products = store.getProducts().filter(p =>
    p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );

  if (!clients.length && !products.length) {
    results.innerHTML = `
      <div class="mobile-search-empty">
        <div class="mobile-search-empty-icon">😔</div>
        Sin resultados para "<strong>${esc(q)}</strong>"
      </div>`;
    return;
  }

  let html = '';

  if (clients.length) {
    html += `<div class="mobile-search-section-label">Clientas</div>`;
    html += clients.slice(0, 6).map(c => {
      const debt = store.getClientDebts(c.id).filter(d => !d.isPaid).length;
      return `
        <div class="mobile-search-item" onclick="closeMobileSearch();navigate('clients');setTimeout(()=>openClientDetail('${esc(c.id)}'),150)">
          <div class="mobile-search-item-thumb">
            ${c.photo ? `<img src="${c.photo}" alt="">` : `<span>${esc(initials(c.name))}</span>`}
          </div>
          <div class="mobile-search-item-info">
            <div class="mobile-search-item-name">${esc(c.name)}</div>
            <div class="mobile-search-item-sub">
              ${c.phone ? '📞 ' + esc(c.phone) : 'Sin teléfono'}
              ${debt > 0 ? ` · <span style="color:var(--danger)">⚠️ ${debt} deuda${debt>1?'s':''}</span>` : ''}
            </div>
          </div>
          <div class="mobile-search-item-arrow">›</div>
        </div>`;
    }).join('');
  }

  if (products.length) {
    html += `<div class="mobile-search-section-label">Prendas</div>`;
    html += products.slice(0, 6).map(p => {
      const stock = p.variants.reduce((s, v) => s + (v.stock || 0), 0);
      return `
        <div class="mobile-search-item" onclick="closeMobileSearch();navigate('catalog');setTimeout(()=>openProductDetail('${esc(p.id)}'),150)">
          <div class="mobile-search-item-thumb">
            ${p.photos?.[0] ? `<img src="${p.photos[0]}" alt="">` : '👗'}
          </div>
          <div class="mobile-search-item-info">
            <div class="mobile-search-item-name">${esc(p.name)}</div>
            <div class="mobile-search-item-sub">${esc(p.category)} · ${fmt(p.price)} · Stock: ${stock}</div>
          </div>
          <div class="mobile-search-item-arrow">›</div>
        </div>`;
    }).join('');
  }

  results.innerHTML = html;
}

window.openMobileSearch  = openMobileSearch;
window.closeMobileSearch = closeMobileSearch;
window.clearMobileSearch = clearMobileSearch;

// Inicializar listener del input mobile
document.addEventListener('DOMContentLoaded', () => {
  const mobileInput = document.getElementById('mobile-search-input');
  const clearBtn    = document.getElementById('mobile-search-clear');

  if (mobileInput) {
    mobileInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      clearBtn?.classList.toggle('visible', q.length > 0);
      if (q.length < 2) {
        const results = document.getElementById('mobile-search-results');
        if (results) results.innerHTML = `
          <div class="mobile-search-hint">
            <div class="mobile-search-hint-icon">🔍</div>
            <div>Escribí para buscar clientas o prendas</div>
          </div>`;
        return;
      }
      renderMobileSearchResults(q);
    });
  }

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileSearch();
  });
});

// ── WhatsApp Receipts ────────────────────────
function sendWhatsAppReceipt(phone, text) {
  if (!phone) { toast('La clienta no tiene teléfono registrado', 'warning'); return; }
  const cleanPhone = String(phone).replace(/\D/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

window.shareSaleWA = function(clientId, saleId) {
  const c = store.getClient(clientId);
  const s = store.getSale(saleId);
  if(!c || !s) return;
  const msg = `¡Hola ${c.name}! Gracias por tu compra en DYG Indumentaria 💖\n\n🛍️ *Detalle:* ${s.productName} ${s.variant ? `(${s.variant.size})` : ''}\n💲 *Total:* ${fmt(s.price*(s.qty||1))}\n💳 *Medio:* ${s.paymentMethod}\n\n¡Que lo disfrutes! ✨`;
  sendWhatsAppReceipt(c.phone, msg);
}

window.sharePaymentWA = function(clientId, debtId, amount) {
  const c = store.getClient(clientId);
  const d = store.getDebt(debtId);
  if(!c || !d) return;
  const msg = `¡Hola ${c.name}! Recibimos tu pago en DYG Indumentaria 💖\n\n💰 *Abono:* ${fmt(amount)}\n🛍️ *Prenda:* ${d.description}\n📉 *Saldo restante:* ${fmt(d.totalAmount - d.paidAmount)}\n\n¡Gracias! ✨`;
  sendWhatsAppReceipt(c.phone, msg);
}
