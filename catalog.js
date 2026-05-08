/* ============================================
   DYGIndumentaria — Catalog Page
   ============================================ */

let catalogFilter = { category: 'Todas', search: '' };

function renderCatalog() {
  const page = document.getElementById('page-catalog');
  if (!page) return;

  const products  = store.getProducts();
  const categories = ['Todas', ...new Set(products.map(p => p.category))];

  page.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>Catálogo de Prendas</h2>
        <p>${products.length} producto${products.length !== 1 ? 's' : ''} en inventario</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary btn-sm" onclick="renderCatalog()">🔄 Actualizar</button>
        <button class="btn btn-primary" onclick="openAddProductModal()">
          ✨ Nueva Prenda
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="catalog-filters">
      <div class="form-control-icon" style="max-width:240px">
        <span class="icon">🔍</span>
        <input class="form-control" id="catalog-search" placeholder="Buscar prenda..."
               value="${esc(catalogFilter.search)}"
               oninput="catalogFilter.search=this.value;renderCatalogGrid()">
      </div>
      <div class="filter-group" id="catalog-cat-filters">
        ${categories.map(c => `
          <button class="filter-chip ${catalogFilter.category === c ? 'active' : ''}"
                  onclick="catalogFilter.category='${esc(c)}';document.querySelectorAll('.filter-chip').forEach(el=>el.classList.remove('active'));this.classList.add('active');renderCatalogGrid()">
            ${esc(c)}
          </button>
        `).join('')}
      </div>
      <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
        <span class="text-muted" style="font-size:.75rem">
          ${products.reduce((s,p) => s + p.variants.reduce((ss,v) => ss + (v.stock||0), 0), 0)} prendas en stock
        </span>
      </div>
    </div>

    <!-- Grid -->
    <div class="catalog-grid" id="catalog-grid">
      ${renderCatalogGridHTML(getFilteredProducts())}
    </div>
  `;
}

function renderCatalogGrid() {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;
  const products = getFilteredProducts();
  grid.innerHTML = renderCatalogGridHTML(products);
}

function getFilteredProducts() {
  let products = store.getProducts();
  if (catalogFilter.category !== 'Todas') {
    products = products.filter(p => p.category === catalogFilter.category);
  }
  if (catalogFilter.search) {
    const q = catalogFilter.search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }
  return products;
}

function renderCatalogGridHTML(products) {
  if (!products.length) return `
    <div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">👗</div>
      <div class="empty-state-title">Sin prendas</div>
      <div class="empty-state-desc">Agregá tu primera prenda al catálogo</div>
      <button class="btn btn-primary" style="margin-top:12px" onclick="openAddProductModal()">+ Nueva Prenda</button>
    </div>
  `;

  return products.map((p, i) => {
    const totalStock  = p.variants.reduce((s, v) => s + (v.stock || 0), 0);
    const uniqueColors = [...new Map(p.variants.map(v => [v.color, v])).values()];
    const uniqueSizes  = [...new Set(p.variants.map(v => v.size))];
    const mainPhoto    = p.photos && p.photos[0];

    return `
      <div class="product-card animate-fade-in-up" style="animation-delay:${i * 0.04}s"
           onclick="openProductDetail('${esc(p.id)}')">
        <div class="product-card-img-wrap">
          ${mainPhoto
            ? `<img src="${mainPhoto}" alt="${esc(p.name)}" loading="lazy">`
            : `<div class="product-card-no-img">
                 <span>👗</span>
                 <span style="font-size:.7rem;color:var(--text-muted)">Sin foto</span>
               </div>`
          }
          <div class="product-card-stock-badge">${stockBadge(totalStock)}</div>
          <div class="product-card-actions">
            <button class="product-card-action-btn edit" title="Editar"
                    onclick="event.stopPropagation();openEditProductModal('${esc(p.id)}')">✏️</button>
            <button class="product-card-action-btn delete" title="Eliminar"
                    onclick="event.stopPropagation();deleteProductConfirm('${esc(p.id)}')">🗑️</button>
          </div>
        </div>
        <div class="product-card-body">
          <div class="product-card-category">${esc(p.category)}</div>
          <div class="product-card-name">${esc(p.name)}</div>
          <div class="product-card-price">${fmt(p.price)}</div>
          <div class="product-card-variants">
            <div class="product-card-color-dots">
              ${uniqueColors.slice(0, 6).map(v => colorDotHTML(v.colorHex, v.color)).join('')}
              ${uniqueColors.length > 6 ? `<span style="font-size:.7rem;color:var(--text-muted)">+${uniqueColors.length-6}</span>` : ''}
            </div>
            <span style="font-size:.7rem;color:var(--text-muted);margin-left:4px">
              ${uniqueSizes.join(' · ')}
            </span>
          </div>
        </div>
        <div class="product-card-footer">
          <span style="font-size:.72rem;color:var(--text-muted)">Stock: <strong style="color:var(--text-primary)">${totalStock}</strong></span>
          <span style="font-size:.72rem;color:var(--text-muted)">Costo: ${fmt(p.costPrice || 0)}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ── Product Detail Modal ──────────────────────
function openProductDetail(productId) {
  const p = store.getProduct(productId);
  if (!p) return;

  const totalStock = p.variants.reduce((s, v) => s + (v.stock || 0), 0);

  // Group variants by size
  const bySize = {};
  for (const v of p.variants) {
    if (!bySize[v.size]) bySize[v.size] = [];
    bySize[v.size].push(v);
  }

  const html = `
    <div class="modal-header">
      <span class="modal-title">${esc(p.name)}</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      ${p.photos && p.photos.length > 0 ? `
        <div id="detail-main-img" class="product-detail-main-img" style="margin-bottom:10px">
          <img id="detail-main-img-el" src="${p.photos[0]}" alt="${esc(p.name)}">
        </div>
        ${p.photos.length > 1 ? `
          <div class="product-detail-thumbs" style="margin-bottom:16px">
            ${p.photos.map((ph, i) => `
              <div class="product-detail-thumb ${i===0?'active':''}" onclick="switchDetailPhoto('${ph}',this)">
                <img src="${ph}" alt="">
              </div>
            `).join('')}
          </div>
        ` : ''}
      ` : `
        <div style="text-align:center;padding:40px;background:var(--bg-dark);border-radius:var(--radius-md);margin-bottom:16px;color:var(--text-muted)">
          <div style="font-size:4rem">👗</div>
          <p style="margin-top:8px;font-size:.8rem">Sin fotos</p>
        </div>
      `}

      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
        <span class="badge badge-gold">${esc(p.category)}</span>
        ${stockBadge(totalStock)}
        <span class="badge badge-neutral">Stock total: ${totalStock}</span>
      </div>

      ${p.description ? `<p style="font-size:.875rem;margin-bottom:16px">${esc(p.description)}</p>` : ''}

      <div class="form-row" style="margin-bottom:16px">
        <div style="background:var(--bg-dark);border-radius:var(--radius-md);padding:14px;text-align:center">
          <div style="font-size:.65rem;color:var(--text-muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px">Precio Venta</div>
          <div style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:var(--gold)">${fmt(p.price)}</div>
        </div>
        <div style="background:var(--bg-dark);border-radius:var(--radius-md);padding:14px;text-align:center">
          <div style="font-size:.65rem;color:var(--text-muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px">Precio Costo</div>
          <div style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:var(--text-secondary)">${fmt(p.costPrice || 0)}</div>
        </div>
      </div>

      <div class="divider-label">Talles y Colores</div>

      <div class="variants-table-wrap">
        <table class="table">
          <thead><tr>
            <th>Talle</th><th>Color</th><th>Stock</th>
          </tr></thead>
          <tbody>
            ${p.variants.map(v => `
              <tr>
                <td><span class="chip">${esc(v.size)}</span></td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    ${colorDotHTML(v.colorHex, v.color)}
                    <span>${esc(v.color)}</span>
                  </div>
                </td>
                <td>
                  <span style="font-weight:600;color:${v.stock===0?'var(--danger)':v.stock<=3?'var(--warning)':'var(--success)'}">
                    ${v.stock}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
      <button class="btn btn-secondary" onclick="openEditProductModal('${esc(p.id)}')">✏️ Editar</button>
      <button class="btn btn-primary" onclick="closeModal();setTimeout(()=>{navigate('sales');openAddSaleModal('${esc(p.id)}')},250)">🛍️ Vender</button>
    </div>
  `;

  openModal(html, { size: 'lg' });
}

function switchDetailPhoto(src, thumbEl) {
  const img = document.getElementById('detail-main-img-el');
  if (img) { img.style.opacity = '0'; setTimeout(() => { img.src = src; img.style.opacity = '1'; img.style.transition = 'opacity .3s'; }, 150); }
  document.querySelectorAll('.product-detail-thumb').forEach(t => t.classList.remove('active'));
  if (thumbEl) thumbEl.classList.add('active');
}

// ── Add / Edit Product Modal ──────────────────
function openAddProductModal() { openProductForm(null); }
function openEditProductModal(id) { openProductForm(id); }

function openProductForm(productId) {
  const p = productId ? store.getProduct(productId) : null;
  const isEdit = !!p;

  const CATEGORIES = ['Blusas','Camisas','Pantalones','Jeans','Vestidos','Faldas','Tops','Abrigos','Buzos','Remeras','Accesorios','Otro'];
  const COLORS_PRESETS = [
    { name:'Blanco',    hex:'#F5F0E8' }, { name:'Negro',   hex:'#1A1A1A' },
    { name:'Gris',      hex:'#7A7A7A' }, { name:'Rojo',    hex:'#C0392B' },
    { name:'Rosa',      hex:'#E8A0A0' }, { name:'Celeste', hex:'#A0C0E8' },
    { name:'Azul',      hex:'#3A5F8A' }, { name:'Verde',   hex:'#4A7A5A' },
    { name:'Amarillo',  hex:'#E8D86E' }, { name:'Naranja', hex:'#E87A3A' },
    { name:'Vino',      hex:'#8B1A2F' }, { name:'Camel',   hex:'#C19A6B' },
    { name:'Champagne', hex:'#D4B896' }, { name:'Beige',   hex:'#D9C5A8' },
    { name:'Manteca',   hex:'#F0E2B0' }, { name:'Crudo',   hex:'#F5EED8' },
  ];

  let variants = p ? JSON.parse(JSON.stringify(p.variants)) : [];
  let photos   = p ? [...(p.photos || [])] : [];

  function buildForm() {
    return `
      <div class="modal-header">
        <span class="modal-title">${isEdit ? '✏️ Editar Prenda' : '✨ Nueva Prenda'}</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <!-- Photos -->
        <div class="form-group">
          <label class="form-label">Fotos de la prenda</label>
          <div class="photo-upload-area" id="product-photo-drop">
            <input type="file" id="product-photo-input" accept="image/*" multiple>
            <div class="photo-upload-icon">📷</div>
            <div class="photo-upload-text">Hacé clic o arrastrá fotos aquí<br><span style="font-size:.7rem;color:var(--text-muted)">JPG, PNG, WEBP — Múltiples</span></div>
          </div>
          <div class="photo-grid" id="product-photo-grid">
            ${renderPhotoGrid(photos)}
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nombre <span class="required">*</span></label>
            <input class="form-control" id="p-name" placeholder="Ej: Blusa Floral" value="${esc(p?.name||'')}">
          </div>
          <div class="form-group">
            <label class="form-label">Categoría <span class="required">*</span></label>
            <select class="form-control" id="p-cat">
              ${CATEGORIES.map(c => `<option value="${esc(c)}" ${p?.category===c?'selected':''}>${esc(c)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Descripción</label>
          <textarea class="form-control" id="p-desc" rows="2" placeholder="Detalles de la prenda...">${esc(p?.description||'')}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Precio de venta <span class="required">*</span></label>
            <div class="form-control-icon">
              <span class="icon">$</span>
              <input class="form-control" id="p-price" type="number" min="0" placeholder="0" value="${p?.price||''}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Precio de costo</label>
            <div class="form-control-icon">
              <span class="icon">$</span>
              <input class="form-control" id="p-cost" type="number" min="0" placeholder="0" value="${p?.costPrice||''}">
            </div>
          </div>
        </div>

        <!-- Variants -->
        <div class="divider-label">Talles & Colores</div>

        <div id="variants-list">
          ${renderVariantsList(variants)}
        </div>

        <!-- Add variant -->
        <div style="background:var(--bg-input);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:14px;margin-top:10px">
          <div style="font-size:.75rem;font-weight:600;color:var(--text-muted);margin-bottom:10px;letter-spacing:.05em">➕ AGREGAR VARIANTE</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;align-items:end">
            <div>
              <label class="form-label">Talle</label>
              <input class="form-control" id="v-size" placeholder="S, M, 38...">
            </div>
            <div>
              <label class="form-label">Color</label>
              <select class="form-control" id="v-color" onchange="document.getElementById('v-colorhex').value=this.options[this.selectedIndex].dataset.hex||'#CCCCCC'">
                <option value="">— Seleccionar —</option>
                ${COLORS_PRESETS.map(c => `<option value="${esc(c.name)}" data-hex="${esc(c.hex)}">${esc(c.name)}</option>`).join('')}
                <option value="_custom">Otro color...</option>
              </select>
            </div>
            <div>
              <label class="form-label">Stock</label>
              <input class="form-control" id="v-stock" type="number" min="0" placeholder="0" value="1">
            </div>
            <button class="btn btn-primary btn-icon" onclick="addVariantRow()" title="Agregar" style="height:40px;width:40px">+</button>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
            <label class="form-label" style="margin:0;flex-shrink:0">Color hex:</label>
            <input type="color" id="v-colorhex" value="#CCCCCC" style="width:36px;height:24px;border:none;background:none;cursor:pointer;border-radius:4px">
            <span style="font-size:.72rem;color:var(--text-muted)">Personalizá el color exacto</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="saveProduct('${esc(productId||'')}')">
          ${isEdit ? '💾 Guardar Cambios' : '✨ Agregar Prenda'}
        </button>
      </div>
    `;
  }

  const backdrop = openModal(buildForm(), { size: 'lg' });

  // Photo upload handler
  setTimeout(() => {
    const input = document.getElementById('product-photo-input');
    const dropArea = document.getElementById('product-photo-drop');

    if (input) {
      input.addEventListener('change', async (e) => {
        for (const file of e.target.files) {
          const b64 = await fileToBase64(file);
          photos.push(b64);
        }
        const grid = document.getElementById('product-photo-grid');
        if (grid) grid.innerHTML = renderPhotoGrid(photos);
        input.value = '';
      });
    }

    if (dropArea) {
      dropArea.addEventListener('dragover', e => { e.preventDefault(); dropArea.classList.add('dragover'); });
      dropArea.addEventListener('dragleave', () => dropArea.classList.remove('dragover'));
      dropArea.addEventListener('drop', async e => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        for (const file of e.dataTransfer.files) {
          if (file.type.startsWith('image/')) {
            const b64 = await fileToBase64(file);
            photos.push(b64);
          }
        }
        const grid = document.getElementById('product-photo-grid');
        if (grid) grid.innerHTML = renderPhotoGrid(photos);
      });
    }
  }, 100);

  // Expose helpers for inline onclick
  window._catalogVariants = variants;
  window._catalogPhotos   = photos;
  window.addVariantRow = function() {
    const size  = document.getElementById('v-size')?.value.trim();
    const color = document.getElementById('v-color')?.value;
    const colorHex = document.getElementById('v-colorhex')?.value || '#CCCCCC';
    const stock = parseInt(document.getElementById('v-stock')?.value) || 0;
    if (!size || !color || color === '_custom') {
      if (!size) toast('Ingresá el talle', 'warning');
      else toast('Seleccioná un color', 'warning');
      return;
    }
    variants.push({ size, color, colorHex, stock });
    window._catalogVariants = variants;
    const list = document.getElementById('variants-list');
    if (list) list.innerHTML = renderVariantsList(variants);
    document.getElementById('v-size').value  = '';
    document.getElementById('v-stock').value = '1';
  };

  window.removeVariant = function(idx) {
    variants.splice(idx, 1);
    window._catalogVariants = variants;
    const list = document.getElementById('variants-list');
    if (list) list.innerHTML = renderVariantsList(variants);
  };

  window.removePhoto = function(idx) {
    photos.splice(idx, 1);
    window._catalogPhotos = photos;
    const grid = document.getElementById('product-photo-grid');
    if (grid) grid.innerHTML = renderPhotoGrid(photos);
  };

  window.saveProduct = function(pid) {
    const name  = document.getElementById('p-name')?.value.trim();
    const cat   = document.getElementById('p-cat')?.value;
    const desc  = document.getElementById('p-desc')?.value.trim();
    const price = parseFloat(document.getElementById('p-price')?.value) || 0;
    const cost  = parseFloat(document.getElementById('p-cost')?.value)  || 0;

    if (!name)  { toast('El nombre es requerido', 'error'); return; }
    if (!price) { toast('Ingresá el precio de venta', 'error'); return; }
    if (variants.length === 0) { toast('Agregá al menos una variante (talle/color)', 'warning'); return; }

    // Snapshot variants before closing
    const finalVariants = JSON.parse(JSON.stringify(window._catalogVariants || variants));
    const finalPhotos   = [...(window._catalogPhotos || photos)];
    const data = { name, category: cat, description: desc, price, costPrice: cost, variants: finalVariants, photos: finalPhotos };

    if (pid) {
      store.updateProduct(pid, data);
      toast('Prenda actualizada ✨', 'success');
    } else {
      store.addProduct(data);
      toast('Prenda agregada al catálogo 🎉', 'success');
    }

    closeModal();
    setTimeout(() => {
      renderCatalog();
      if (window.currentPage === 'dashboard') renderDashboard();
    }, 250);
  };
}

function renderVariantsList(variants) {
  if (!variants.length) return `<div style="text-align:center;padding:16px;color:var(--text-muted);font-size:.8rem">Sin variantes — agregá talles y colores abajo ⬇️</div>`;
  return `
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Talle</th><th>Color</th><th>Stock</th><th></th></tr></thead>
        <tbody>
          ${variants.map((v, i) => `
            <tr>
              <td><span class="chip">${esc(v.size)}</span></td>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  ${colorDotHTML(v.colorHex, v.color)}
                  <span>${esc(v.color)}</span>
                </div>
              </td>
              <td>
                <input type="number" min="0" value="${v.stock}"
                  class="form-control" style="width:70px;padding:5px 8px"
                  onchange="window._catalogVariants[${i}].stock=parseInt(this.value)||0">
              </td>
              <td>
                <button class="btn btn-danger btn-sm" onclick="removeVariant(${i})">✕</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderPhotoGrid(photos) {
  if (!photos.length) return '';
  return photos.map((ph, i) => `
    <div class="photo-thumb">
      <img src="${ph}" alt="foto ${i+1}">
      <div class="photo-thumb-del" onclick="removePhoto(${i})">✕</div>
    </div>
  `).join('');
}

// ── Delete Product ────────────────────────────
async function deleteProductConfirm(id) {
  const p = store.getProduct(id);
  if (!p) return;
  const ok = await confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`,
    { title: 'Eliminar Prenda', icon: '🗑️', danger: true });
  if (!ok) return;
  store.deleteProduct(id);
  toast('Prenda eliminada', 'success');
  renderCatalog();
}
