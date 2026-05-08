/* ============================================
   DYGIndumentaria — Data Store (localStorage)
   CRUD completo para todos los módulos
   ============================================ */

const DB_KEY = 'dyg_store_v3';

// ── Default / Seed Data ──────────────────────
function getDefaultData() {
  const now = Date.now();
  const day = 86400000;

  return {
    products: [
      {
        id: 'p1',
        name: 'Blusa Floral Italiana',
        category: 'Blusas',
        description: 'Blusa de gasa con estampado floral, mangas 3/4. Ideal para salidas y eventos.',
        price: 18500,
        costPrice: 9000,
        photos: [],
        variants: [
          { size: 'S',  color: 'Blanco',  colorHex: '#F5F0E8', stock: 3 },
          { size: 'M',  color: 'Blanco',  colorHex: '#F5F0E8', stock: 5 },
          { size: 'M',  color: 'Rosa',    colorHex: '#E8A0A0', stock: 2 },
          { size: 'L',  color: 'Rosa',    colorHex: '#E8A0A0', stock: 1 },
          { size: 'L',  color: 'Celeste', colorHex: '#A0C0E8', stock: 4 },
          { size: 'XL', color: 'Celeste', colorHex: '#A0C0E8', stock: 0 },
        ],
        featured: true,
        createdAt: now - 30 * day,
      },
      {
        id: 'p2',
        name: 'Jean Skinny Premium',
        category: 'Pantalones',
        description: 'Jean elastizado de corte skinny con efecto push-up. Tiro alto, cierre frontal.',
        price: 32000,
        costPrice: 16000,
        photos: [],
        variants: [
          { size: '36', color: 'Azul',   colorHex: '#3A5F8A', stock: 4 },
          { size: '38', color: 'Azul',   colorHex: '#3A5F8A', stock: 6 },
          { size: '40', color: 'Azul',   colorHex: '#3A5F8A', stock: 3 },
          { size: '38', color: 'Negro',  colorHex: '#1A1A1A', stock: 5 },
          { size: '40', color: 'Negro',  colorHex: '#1A1A1A', stock: 2 },
          { size: '42', color: 'Negro',  colorHex: '#1A1A1A', stock: 0 },
          { size: '36', color: 'Gris',   colorHex: '#7A7A7A', stock: 2 },
          { size: '38', color: 'Gris',   colorHex: '#7A7A7A', stock: 3 },
        ],
        featured: true,
        createdAt: now - 25 * day,
      },
      {
        id: 'p3',
        name: 'Vestido Midi Romántico',
        category: 'Vestidos',
        description: 'Vestido midi con escote en V, cintura ajustada con lazo. Tela fluida importada.',
        price: 45000,
        costPrice: 22000,
        photos: [],
        variants: [
          { size: 'S',  color: 'Vino',   colorHex: '#8B1A2F', stock: 2 },
          { size: 'M',  color: 'Vino',   colorHex: '#8B1A2F', stock: 3 },
          { size: 'L',  color: 'Vino',   colorHex: '#8B1A2F', stock: 1 },
          { size: 'S',  color: 'Verde',  colorHex: '#4A7A5A', stock: 4 },
          { size: 'M',  color: 'Verde',  colorHex: '#4A7A5A', stock: 2 },
        ],
        featured: true,
        createdAt: now - 20 * day,
      },
      {
        id: 'p4',
        name: 'Cardigan Suave',
        category: 'Abrigos',
        description: 'Cardigan de tejido fino con cierre de botones. Abriga sin recargar el look.',
        price: 28000,
        costPrice: 14000,
        photos: [],
        variants: [
          { size: 'Único', color: 'Camel',  colorHex: '#C19A6B', stock: 5 },
          { size: 'Único', color: 'Crudo',  colorHex: '#F5EED8', stock: 4 },
          { size: 'Único', color: 'Negro',  colorHex: '#1A1A1A', stock: 3 },
        ],
        featured: false,
        createdAt: now - 15 * day,
      },
      {
        id: 'p5',
        name: 'Falda Plisada Satinada',
        category: 'Faldas',
        description: 'Falda plisada midi en tela satinada con elástico en cintura. Efecto espejo.',
        price: 22000,
        costPrice: 10500,
        photos: [],
        variants: [
          { size: 'S',  color: 'Champagne', colorHex: '#D4B896', stock: 3 },
          { size: 'M',  color: 'Champagne', colorHex: '#D4B896', stock: 4 },
          { size: 'L',  color: 'Champagne', colorHex: '#D4B896', stock: 2 },
          { size: 'M',  color: 'Negro',     colorHex: '#1A1A1A', stock: 5 },
          { size: 'L',  color: 'Negro',     colorHex: '#1A1A1A', stock: 3 },
        ],
        featured: false,
        createdAt: now - 10 * day,
      },
      {
        id: 'p6',
        name: 'Top Crop Lencero',
        category: 'Tops',
        description: 'Top crop estilo lencero con breteles finos y puntilla en escote. Muy versátil.',
        price: 12000,
        costPrice: 5500,
        photos: [],
        variants: [
          { size: 'S',  color: 'Blanco',    colorHex: '#F5F0E8', stock: 6 },
          { size: 'M',  color: 'Blanco',    colorHex: '#F5F0E8', stock: 5 },
          { size: 'S',  color: 'Negro',     colorHex: '#1A1A1A', stock: 7 },
          { size: 'M',  color: 'Negro',     colorHex: '#1A1A1A', stock: 4 },
          { size: 'L',  color: 'Negro',     colorHex: '#1A1A1A', stock: 2 },
          { size: 'S',  color: 'Manteca',   colorHex: '#F0E2B0', stock: 3 },
          { size: 'M',  color: 'Manteca',   colorHex: '#F0E2B0', stock: 3 },
        ],
        featured: true,
        createdAt: now - 5 * day,
      },
    ],

    clients: [
      {
        id: 'c1',
        name: 'Valentina Rodríguez',
        phone: '11 2345-6789',
        email: 'valen.r@gmail.com',
        address: 'Av. Corrientes 1234, CABA',
        notes: 'Prefiere talles M. Le gustan los vestidos y blusas.',
        photo: null,
        createdAt: now - 90 * day,
      },
      {
        id: 'c2',
        name: 'Luciana Martínez',
        phone: '11 9876-5432',
        email: 'luci.m@hotmail.com',
        address: 'Palermo, CABA',
        notes: 'Clienta frecuente. Paga siempre en efectivo.',
        photo: null,
        createdAt: now - 80 * day,
      },
      {
        id: 'c3',
        name: 'Sofía González',
        phone: '11 5555-1234',
        email: '',
        address: 'Belgrano, CABA',
        notes: '',
        photo: null,
        createdAt: now - 60 * day,
      },
      {
        id: 'c4',
        name: 'Camila López',
        phone: '11 4444-9876',
        email: 'cami.lop@gmail.com',
        address: 'San Telmo, CABA',
        notes: 'Talles L-XL. Fan de los jeans.',
        photo: null,
        createdAt: now - 45 * day,
      },
      {
        id: 'c5',
        name: 'Florencia Pérez',
        phone: '11 3333-4567',
        email: '',
        address: 'Recoleta, CABA',
        notes: 'Muy exigente con la calidad.',
        photo: null,
        createdAt: now - 30 * day,
      },
    ],

    sales: [
      {
        id: 's1',
        productId: 'p3',
        productName: 'Vestido Midi Romántico',
        variant: { size: 'M', color: 'Vino', colorHex: '#8B1A2F' },
        qty: 1,
        price: 45000,
        clientId: 'c1',
        clientName: 'Valentina Rodríguez',
        paymentMethod: 'Efectivo',
        isPaid: true,
        debtId: null,
        notes: '',
        date: now - 2 * day,
      },
      {
        id: 's2',
        productId: 'p1',
        productName: 'Blusa Floral Italiana',
        variant: { size: 'M', color: 'Blanco', colorHex: '#F5F0E8' },
        qty: 2,
        price: 18500,
        clientId: 'c2',
        clientName: 'Luciana Martínez',
        paymentMethod: 'Transferencia',
        isPaid: true,
        debtId: null,
        notes: '',
        date: now - 5 * day,
      },
      {
        id: 's3',
        productId: 'p2',
        productName: 'Jean Skinny Premium',
        variant: { size: '38', color: 'Negro', colorHex: '#1A1A1A' },
        qty: 1,
        price: 32000,
        clientId: 'c3',
        clientName: 'Sofía González',
        paymentMethod: 'Cuenta corriente',
        isPaid: false,
        debtId: 'd1',
        notes: 'Paga el viernes',
        date: now - 7 * day,
      },
      {
        id: 's4',
        productId: 'p6',
        productName: 'Top Crop Lencero',
        variant: { size: 'S', color: 'Negro', colorHex: '#1A1A1A' },
        qty: 3,
        price: 12000,
        clientId: 'c4',
        clientName: 'Camila López',
        paymentMethod: 'Efectivo',
        isPaid: true,
        debtId: null,
        notes: '',
        date: now - 10 * day,
      },
      {
        id: 's5',
        productId: 'p5',
        productName: 'Falda Plisada Satinada',
        variant: { size: 'L', color: 'Champagne', colorHex: '#D4B896' },
        qty: 1,
        price: 22000,
        clientId: 'c2',
        clientName: 'Luciana Martínez',
        paymentMethod: 'Cuenta corriente',
        isPaid: false,
        debtId: 'd2',
        notes: '',
        date: now - 12 * day,
      },
      {
        id: 's6',
        productId: 'p4',
        productName: 'Cardigan Suave',
        variant: { size: 'Único', color: 'Camel', colorHex: '#C19A6B' },
        qty: 1,
        price: 28000,
        clientId: 'c1',
        clientName: 'Valentina Rodríguez',
        paymentMethod: 'Efectivo',
        isPaid: true,
        debtId: null,
        notes: '',
        date: now - 18 * day,
      },
      {
        id: 's7',
        productId: 'p3',
        productName: 'Vestido Midi Romántico',
        variant: { size: 'S', color: 'Verde', colorHex: '#4A7A5A' },
        qty: 1,
        price: 45000,
        clientId: 'c5',
        clientName: 'Florencia Pérez',
        paymentMethod: 'Cuenta corriente',
        isPaid: false,
        debtId: 'd3',
        notes: 'Pagó 20000 de seña',
        date: now - 20 * day,
      },
    ],

    debts: [
      {
        id: 'd1',
        clientId: 'c3',
        clientName: 'Sofía González',
        saleId: 's3',
        description: 'Jean Skinny Premium (38, Negro)',
        totalAmount: 32000,
        paidAmount: 0,
        isPaid: false,
        createdAt: now - 7 * day,
        payments: [],
      },
      {
        id: 'd2',
        clientId: 'c2',
        clientName: 'Luciana Martínez',
        saleId: 's5',
        description: 'Falda Plisada Satinada (L, Champagne)',
        totalAmount: 22000,
        paidAmount: 10000,
        isPaid: false,
        createdAt: now - 12 * day,
        payments: [
          { amount: 10000, date: now - 8 * day, note: 'Pago parcial en efectivo' },
        ],
      },
      {
        id: 'd3',
        clientId: 'c5',
        clientName: 'Florencia Pérez',
        saleId: 's7',
        description: 'Vestido Midi Romántico (S, Verde) — seña 20000',
        totalAmount: 45000,
        paidAmount: 20000,
        isPaid: false,
        createdAt: now - 20 * day,
        payments: [
          { amount: 20000, date: now - 20 * day, note: 'Seña inicial' },
        ],
      },
    ],

    cash_movements: [],
    settings: {
      currency: '$',
      storeName: 'DYGIndumentaria',
    },
  };
}

// ── Store Class ──────────────────────────────
class Store {
  constructor() {
    this._data = null;
  }

  load() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      this._data = raw ? JSON.parse(raw) : null;
    } catch {
      this._data = null;
    }

    if (!this._data) {
      this._data = getDefaultData();
      this.save();
    }

    // Ensure all collections exist
    const def = getDefaultData();
    for (const key of Object.keys(def)) {
      if (!(key in this._data)) this._data[key] = def[key];
    }
    return this;
  }

  save() {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(this._data));
    } catch(e) {
      console.error('Save error:', e);
    }
    return this;
  }

  // ── PRODUCTS ──────────────────────
  getProducts() { return [...this._data.products]; }
  getProduct(id) { return this._data.products.find(p => p.id === id) || null; }

  addProduct(data) {
    const product = { id: 'p' + Date.now(), createdAt: Date.now(), ...data };
    this._data.products.unshift(product);
    this.save();
    return product;
  }

  updateProduct(id, data) {
    const idx = this._data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this._data.products[idx] = { ...this._data.products[idx], ...data };
    this.save();
    return this._data.products[idx];
  }

  deleteProduct(id) {
    this._data.products = this._data.products.filter(p => p.id !== id);
    this.save();
  }

  // ── CLIENTS ──────────────────────
  getClients() { return [...this._data.clients]; }
  getClient(id) { return this._data.clients.find(c => c.id === id) || null; }

  addClient(data) {
    const client = { id: 'c' + Date.now(), createdAt: Date.now(), ...data };
    this._data.clients.push(client);
    this.save();
    return client;
  }

  updateClient(id, data) {
    const idx = this._data.clients.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this._data.clients[idx] = { ...this._data.clients[idx], ...data };
    this.save();
    return this._data.clients[idx];
  }

  deleteClient(id) {
    this._data.clients = this._data.clients.filter(c => c.id !== id);
    this.save();
  }

  // ── SALES ──────────────────────
  getSales() { return [...this._data.sales].sort((a,b) => b.date - a.date); }
  getSale(id) { return this._data.sales.find(s => s.id === id) || null; }

  addSale(data) {
    const sale = { id: 's' + Date.now(), date: Date.now(), ...data };
    this._data.sales.push(sale);
    // Update stock
    if (data.productId && data.variant) {
      const p = this._data.products.find(p => p.id === data.productId);
      if (p) {
        const v = p.variants.find(v =>
          v.size === data.variant.size && v.color === data.variant.color
        );
        if (v) v.stock = Math.max(0, (v.stock || 0) - (data.qty || 1));
      }
    }
    this.save();
    return sale;
  }

  deleteSale(id) {
    const sale = this.getSale(id);
    if (sale) {
      // Restore stock
      const p = this._data.products.find(p => p.id === sale.productId);
      if (p && sale.variant) {
        const v = p.variants.find(v =>
          v.size === sale.variant.size && v.color === sale.variant.color
        );
        if (v) v.stock += (sale.qty || 1);
      }
      // Remove linked debt
      if (sale.debtId) this.deleteDebt(sale.debtId);
    }
    this._data.sales = this._data.sales.filter(s => s.id !== id);
    this.save();
  }

  // ── DEBTS ──────────────────────
  getDebts() { return [...this._data.debts].sort((a,b) => b.createdAt - a.createdAt); }
  getDebt(id) { return this._data.debts.find(d => d.id === id) || null; }

  addDebt(data) {
    const debt = { id: 'd' + Date.now(), createdAt: Date.now(), paidAmount: 0, payments: [], isPaid: false, ...data };
    this._data.debts.push(debt);
    this.save();
    return debt;
  }

  registerPayment(debtId, amount, note = '') {
    const debt = this._data.debts.find(d => d.id === debtId);
    if (!debt) return null;
    const payment = { amount: Number(amount), date: Date.now(), note };
    debt.payments.push(payment);
    debt.paidAmount = (debt.paidAmount || 0) + Number(amount);
    if (debt.paidAmount >= debt.totalAmount) {
      debt.isPaid = true;
      debt.paidAmount = debt.totalAmount;
      // Mark sale as paid
      const sale = this._data.sales.find(s => s.id === debt.saleId);
      if (sale) sale.isPaid = true;
    }
    this.save();
    return debt;
  }

  deleteDebt(id) {
    this._data.debts = this._data.debts.filter(d => d.id !== id);
    this.save();
  }

  // ── CASH MOVEMENTS ─────────────────
  getCashMovements() { return [...(this._data.cash_movements || [])]; }
  
  addCashMovement(data) {
    if (!this._data.cash_movements) this._data.cash_movements = [];
    const movement = { id: 'm' + Date.now(), createdAt: Date.now(), ...data };
    this._data.cash_movements.unshift(movement);
    this.save();
    return movement;
  }
  
  deleteCashMovement(id) {
    if (!this._data.cash_movements) return;
    this._data.cash_movements = this._data.cash_movements.filter(m => m.id !== id);
    this.save();
  }

  // ── COMPUTED ──────────────────────
  getClientDebts(clientId) {
    return this._data.debts.filter(d => d.clientId === clientId);
  }

  getClientSales(clientId) {
    return this._data.sales.filter(s => s.clientId === clientId)
      .sort((a,b) => b.date - a.date);
  }

  getTotalDebt() {
    return this._data.debts
      .filter(d => !d.isPaid)
      .reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);
  }

  getTotalRevenue(fromDate = 0, toDate = Infinity) {
    const directSales = this._data.sales
      .filter(s => s.paymentMethod !== 'Cuenta corriente' && s.date >= fromDate && s.date < toDate)
      .reduce((sum, s) => sum + s.price * (s.qty || 1), 0);

    const debtPayments = this._data.debts.reduce((sum, d) => {
      return sum + (d.payments || [])
        .filter(p => p.date >= fromDate && p.date < toDate)
        .reduce((s, p) => s + Number(p.amount), 0);
    }, 0);

    return directSales + debtPayments;
  }

  getTotalStock() {
    return this._data.products.reduce((sum, p) =>
      sum + (p.variants || []).reduce((s, v) => s + (v.stock || 0), 0), 0
    );
  }

  getSalesByPeriod(days) {
    const from = Date.now() - days * 86400000;
    return this._data.sales.filter(s => s.date >= from).sort((a,b) => a.date - b.date);
  }

  getTopProducts(limit = 5) {
    const counts = {};
    for (const s of this._data.sales) {
      counts[s.productId] = (counts[s.productId] || { name: s.productName, qty: 0, revenue: 0 });
      counts[s.productId].qty += (s.qty || 1);
      counts[s.productId].revenue += s.price * (s.qty || 1);
    }
    return Object.values(counts).sort((a,b) => b.qty - a.qty).slice(0, limit);
  }

  getSettings() { return { ...this._data.settings }; }
  updateSettings(data) {
    this._data.settings = { ...this._data.settings, ...data };
    this.save();
  }

  // ── Clear all data & reset to defaults ──
  clearAllData() {
    try {
      // Remove ALL localStorage keys (dyg_ prefix + any legacy keys)
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('dyg_') || k.includes('store'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      // Also clear the current key explicitly
      localStorage.removeItem(DB_KEY);
      localStorage.removeItem('dyg_store_v2');
      localStorage.removeItem('dyg_store_v1');
      this._data = null;
    } catch(e) {
      console.error('Clear error:', e);
    }
  }
}

const store = new Store();
