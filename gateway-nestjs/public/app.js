// IndiTrade - Unified Hybrid Persistent Engine (SQLite Cloud + LocalStorage Fallback)

// Initial Setup Check
const IS_SERVER_MODE = window.location.protocol.startsWith('http');

// Fallback HTML5 Database (Initial Seed Data)
const SEED_HUBS = [
  { id: 'surat', name: 'Surat Textile Hub', location: 'Gujarat', category: 'Textiles & Apparel', count: '1,420+ Mills', icon: '🧵' },
  { id: 'morbi', name: 'Morbi Ceramic Hub', location: 'Gujarat', category: 'Building Materials', count: '850+ Factories', icon: '🧱' },
  { id: 'tirupur', name: 'Tirupur Garment Cluster', location: 'Tamil Nadu', category: 'Apparel & Knitwear', count: '1,100+ Manufacturers', icon: '👕' },
  { id: 'aligarh', name: 'Aligarh Hardware Hub', location: 'Uttar Pradesh', category: 'Industrial & Hardware', count: '620+ Units', icon: '🔐' },
  { id: 'assam', name: 'Assam Tea Plantations', location: 'Assam', category: 'Agriculture & Food', count: '340+ Estates', icon: '🍃' },
  { id: 'moradabad', name: 'Moradabad Brassware Hub', location: 'Uttar Pradesh', category: 'Handicrafts & Decor', count: '480+ Artisans', icon: '🏺' }
];

const SEED_SUPPLIERS = [
  { id: 1, name: 'Gujarat Handloom & Silk Weaves', location: 'Surat, Gujarat', state: 'Gujarat', joined: '6 Years on Platform', trustScore: '98%', responseTime: '< 2 Hours', gstin: '24AAAFF1234F1Z5', iso: 'ISO 9001:2015 Certified', verified: true },
  { id: 2, name: 'Morbi Ceramic export-import Corp', location: 'Morbi, Gujarat', state: 'Gujarat', joined: '4 Years on Platform', trustScore: '96%', responseTime: '< 3 Hours', gstin: '24BBBDD4321A2Z3', iso: 'ISO 14001 Compliant', verified: true },
  { id: 3, name: 'Tirupur Apparel Craft Mills', location: 'Tirupur, Tamil Nadu', state: 'Tamil Nadu', joined: '8 Years on Platform', trustScore: '99%', responseTime: '< 1 Hour', gstin: '33AAACT7890C1Z4', iso: 'WRAP & Oeko-Tex Standard 100', verified: true },
  { id: 4, name: 'Aligarh Industrial Security Locks Ltd', location: 'Aligarh, Uttar Pradesh', state: 'Uttar Pradesh', joined: '12 Years on Platform', trustScore: '97%', responseTime: '< 4 Hours', gstin: '09AAACA1299C2Z8', iso: 'ISO 9001:2015 Approved', verified: true },
  { id: 5, name: 'Assam Valley Tea Growers Cooperative', location: 'Dibrugarh, Assam', state: 'Assam', joined: '5 Years on Platform', trustScore: '95%', responseTime: '< 2 Hours', gstin: '18AAACA5555L1Z1', iso: 'FSSAI & Spice Board India Registered', verified: true }
];

const SEED_PRODUCTS = [
  {
    id: 'p1',
    name: 'Pure Banarasi Silk Designer Saree Collection',
    category: 'Textiles & Garments',
    hub: 'surat',
    weightPerUnit: 0.8,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
    ],
    hsn: '50072010',
    unit: 'Pieces',
    moq: 100,
    tiers: [
      { min: 100, max: 299, price: 850 },
      { min: 300, max: 999, price: 720 },
      { min: 1000, max: null, price: 600 }
    ],
    leadTime: '15 days (Under 500 pcs)',
    description: 'Exquisite Banarasi sarees made with rich golden zari borders and premium synthetic-silk blend. Perfect for boutiques and large retailers. Available in 12 traditional colors. Dry clean only.',
    supplier: SEED_SUPPLIERS[0]
  },
  {
    id: 'p2',
    name: 'Premium Double Charge Polished Vitrified Floor Tiles',
    category: 'Home & Ceramics',
    hub: 'morbi',
    weightPerUnit: 14.5,
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'
    ],
    hsn: '69072100',
    unit: 'Sqm',
    moq: 500,
    tiers: [
      { min: 500, max: 1999, price: 340 },
      { min: 2000, max: 4999, price: 290 },
      { min: 5000, max: null, price: 250 }
    ],
    leadTime: '20 days (Factory dispatch)',
    description: '600x1200mm gloss finished vitrified floor tiles with exceptional scratch and stain resistance. Ideal for builders, architects, and large hardware importers.',
    supplier: SEED_SUPPLIERS[1]
  },
  {
    id: 'p3',
    name: '100% Combed Cotton Bio-Washed Wholesale Plain Tees',
    category: 'Textiles & Garments',
    hub: 'tirupur',
    weightPerUnit: 0.2,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80'
    ],
    hsn: '61091000',
    unit: 'Pieces',
    moq: 200,
    tiers: [
      { min: 200, max: 999, price: 110 },
      { min: 1000, max: 4999, price: 95 },
      { min: 5000, max: null, price: 80 }
    ],
    leadTime: '12 days (Stock colors)',
    description: '180 GSM, super-soft combed cotton wholesale shirts perfect for custom printing, embroidery, corporate giveaways, or private labels.',
    supplier: SEED_SUPPLIERS[2]
  }
];

const SEED_RFQS = [
  {
    id: 1,
    title: 'Sourcing 5,000 Pcs Bio-Washed Hoodies for Winter Sourcing',
    category: 'Textiles & Garments',
    quantity: 5000,
    unit: 'Pieces',
    targetPrice: 320,
    buyerName: 'Aman G. (TrendSet Apparel)',
    buyerLocation: 'Bengaluru, Karnataka',
    datePosted: '2 hours ago',
    description: 'Looking for 300 GSM fleece bio-washed hoodies in 5 mix corporate colors. Need custom neck label prints. Factory must provide certificates and samples.',
    status: 'Active (2 Bids)',
    bids: [
      { supplier: 'South Textile Mills', bidPrice: 310, date: '1 hour ago' }
    ]
  }
];

const SEED_ORDERS = [
  {
    id: 'ORD-9872',
    parentCode: 'ORD-9872',
    productName: 'Premium Double Charge Polished Vitrified Floor Tiles',
    buyerName: 'Kunal Builders (Mumbai)',
    quantity: 1500,
    subtotal: 510000,
    tax: 91800,
    freight: 130500,
    total: 732300,
    status: 'Escrow Funded',
    date: 'Yesterday',
    supplierId: 2 // Morbi Ceramic
  }
];

// Initialize LocalStorage Data Store
function initLocalStorage() {
  if (!localStorage.getItem('inditrade_hubs')) localStorage.setItem('inditrade_hubs', JSON.stringify(SEED_HUBS));
  if (!localStorage.getItem('inditrade_suppliers')) localStorage.setItem('inditrade_suppliers', JSON.stringify(SEED_SUPPLIERS));
  if (!localStorage.getItem('inditrade_products')) localStorage.setItem('inditrade_products', JSON.stringify(SEED_PRODUCTS));
  if (!localStorage.getItem('inditrade_rfqs')) localStorage.setItem('inditrade_rfqs', JSON.stringify(SEED_RFQS));
  if (!localStorage.getItem('inditrade_orders')) localStorage.setItem('inditrade_orders', JSON.stringify(SEED_ORDERS));
  if (!localStorage.getItem('inditrade_inquiries')) {
    localStorage.setItem('inditrade_inquiries', JSON.stringify([
      {
        id: 'inq1',
        productName: 'Bio-Washed Wholesale Plain Tees',
        buyerName: 'Aman Gupta (TrendSet)',
        message: 'Order of 3,000 Pieces - Pending Escrow safe Payment Verification.',
        date: 'Today, 11:30 AM',
        status: 'Unread',
        supplierId: 3 // Tirupur
      },
      {
        id: 'inq2',
        productName: 'Double Charge Polished Vitrified Floor Tiles',
        buyerName: 'Preeti Builders',
        message: 'Requesting freight quote details for tiles shipment to Ahmedabad.',
        date: 'Yesterday',
        status: 'Replied',
        supplierId: 2 // Morbi Ceramic
      }
    ]));
  }
}
initLocalStorage();

// Global Dynamic State Manager
const state = {
  products: [],
  rfqs: [],
  hubs: [],
  suppliers: [],
  orders: [],
  inquiries: [],
  currentView: 'home',
  selectedProductId: null,
  userRole: 'buyer',
  activeSupplierId: 1, // Default to first supplier
  searchQuery: '',
  selectedHub: '',
  selectedCategories: []
};

// 2. Initial Bootstrapper
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  bindGlobalEvents();
  
  // Refresh Dynamic Feeds
  loadAllFeeds();
  
  // Start active sourcing lead simulator in the background
  initLiveSourcingSimulator();
});

function loadAllFeeds() {
  fetchHubs();
  fetchProducts();
  fetchRFQs();
  fetchSuppliers();
  fetchOrders();
  fetchInquiries();
}

// 3. Dynamic Database Bridges (Server REST vs Browser LocalStorage)
async function fetchHubs() {
  if (IS_SERVER_MODE) {
    try {
      const res = await fetch('/api/hubs');
      state.hubs = await res.json();
    } catch (e) { loadHubsLocal(); }
  } else {
    loadHubsLocal();
  }
  renderHubs();
}
function loadHubsLocal() {
  state.hubs = JSON.parse(localStorage.getItem('inditrade_hubs'));
}

async function fetchProducts() {
  if (IS_SERVER_MODE) {
    try {
      let url = '/api/products?';
      if (state.selectedHub) url += `hub=${state.selectedHub}&`;
      if (state.searchQuery) url += `search=${state.searchQuery}&`;
      const res = await fetch(url);
      state.products = await res.json();
      
      if (state.selectedCategories.length > 0) {
        state.products = state.products.filter(p => state.selectedCategories.includes(p.category));
      }
    } catch (e) { loadProductsLocal(); }
  } else {
    loadProductsLocal();
  }
  renderProducts();
}
function loadProductsLocal() {
  let localProds = JSON.parse(localStorage.getItem('inditrade_products'));
  state.products = localProds.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesHub = state.selectedHub === '' || p.hub === state.selectedHub;
    const matchesCat = state.selectedCategories.length === 0 || state.selectedCategories.includes(p.category);
    return matchesSearch && matchesHub && matchesCat;
  });
}

async function fetchRFQs() {
  if (IS_SERVER_MODE) {
    try {
      const res = await fetch('/api/rfqs');
      state.rfqs = await res.json();
    } catch (e) { loadRFQsLocal(); }
  } else {
    loadRFQsLocal();
  }
  renderRFQs();
  updateHeaderStats();
}
function loadRFQsLocal() {
  state.rfqs = JSON.parse(localStorage.getItem('inditrade_rfqs'));
}

async function fetchSuppliers() {
  if (IS_SERVER_MODE) {
    try {
      const res = await fetch('/api/suppliers');
      state.suppliers = await res.json();
    } catch (e) { loadSuppliersLocal(); }
  } else {
    loadSuppliersLocal();
  }
  populateSuppliersDropdown();
}
function loadSuppliersLocal() {
  state.suppliers = JSON.parse(localStorage.getItem('inditrade_suppliers'));
}

async function fetchOrders() {
  if (IS_SERVER_MODE) {
    try {
      // Secure Multi-Vendor Scoped Order Fetching
      const res = await fetch(`/api/orders?supplierId=${state.activeSupplierId}`);
      state.orders = await res.json();
    } catch (e) { loadOrdersLocal(); }
  } else {
    loadOrdersLocal();
  }
  renderSupplierDashboard();
}
function loadOrdersLocal() {
  // Scoped local order filtering
  const allOrders = JSON.parse(localStorage.getItem('inditrade_orders'));
  state.orders = allOrders.filter(o => o.supplierId == state.activeSupplierId);
}

function fetchInquiries() {
  state.inquiries = JSON.parse(localStorage.getItem('inditrade_inquiries')) || [];
}

// 4. Data Mutators (Server Commits + Local Persistence)
async function registerSupplier(name, location, stateName, gstin, iso) {
  if (IS_SERVER_MODE) {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location, stateName, gstin, iso })
      });
      const data = await response.json();
      if (response.ok) {
        showNotification(data.message);
        fetchSuppliers();
        return true;
      } else {
        showNotification(data.error, 'error');
        return false;
      }
    } catch (err) { return registerSupplierLocal(name, location, stateName, gstin, iso); }
  } else {
    return registerSupplierLocal(name, location, stateName, gstin, iso);
  }
}
function registerSupplierLocal(name, location, stateName, gstin, iso) {
  let localSups = JSON.parse(localStorage.getItem('inditrade_suppliers'));
  
  if (localSups.some(s => s.gstin === gstin)) {
    showNotification('This business GSTIN is already registered', 'error');
    return false;
  }

  const newSupplier = {
    id: localSups.length + 1,
    name, location, state: stateName,
    joined: 'Joined Today',
    trustScore: '100%',
    responseTime: '< 1 Hour',
    gstin, iso: iso || 'ISO Certified MSME',
    verified: true
  };

  localSups.unshift(newSupplier);
  localStorage.setItem('inditrade_suppliers', JSON.stringify(localSups));
  showNotification('Supplier profile onboarded successfully to browser storage!');
  fetchSuppliers();
  return true;
}

async function createProduct(name, category, hub, weight, moq, unit, maxP, minP, hsn, desc, supplierId) {
  if (IS_SERVER_MODE) {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, category, hub, weightPerUnit: weight, moq, unit, priceMax: maxP, priceMin: minP, hsn, description: desc, supplierId
        })
      });
      const data = await response.json();
      if (response.ok) {
        showNotification(data.message);
        loadAllFeeds();
        return true;
      } else {
        showNotification(data.error, 'error');
        return false;
      }
    } catch (err) { return createProductLocal(name, category, hub, weight, moq, unit, maxP, minP, hsn, desc, supplierId); }
  } else {
    return createProductLocal(name, category, hub, weight, moq, unit, maxP, minP, hsn, desc, supplierId);
  }
}
function getWholesaleProductImage(category) {
  let defaultImage = 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80'; // generic hardware
  let extraImages = [defaultImage];
  
  const catLower = (category || '').toLowerCase();
  if (catLower.includes('textile') || catLower.includes('garment') || catLower.includes('apparel')) {
    defaultImage = 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=600&q=80';
    extraImages = [
      'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
    ];
  } else if (catLower.includes('ceramic') || catLower.includes('home') || catLower.includes('building')) {
    defaultImage = 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80';
    extraImages = [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'
    ];
  } else if (catLower.includes('food') || catLower.includes('agri') || catLower.includes('tea')) {
    defaultImage = 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80';
    extraImages = [
      'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=600&q=80'
    ];
  } else if (catLower.includes('hardware') || catLower.includes('industrial') || catLower.includes('tool')) {
    defaultImage = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
    extraImages = [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?auto=format&fit=crop&w=600&q=80'
    ];
  }
  return { image: defaultImage, images: extraImages };
}

function createProductLocal(name, category, hub, weight, moq, unit, maxP, minP, hsn, desc, supplierId) {
  let localProds = JSON.parse(localStorage.getItem('inditrade_products'));
  let suppliers = JSON.parse(localStorage.getItem('inditrade_suppliers'));
  
  const supplier = suppliers.find(s => s.id == supplierId) || SEED_SUPPLIERS[0];
  const media = getWholesaleProductImage(category);

  const newProd = {
    id: 'p_' + Date.now(),
    name, category, hub,
    weightPerUnit: parseFloat(weight) || 1.0,
    image: media.image,
    images: media.images,
    hsn: hsn || '84818030',
    unit, moq: parseInt(moq),
    leadTime: '15 days ex-factory',
    description: desc,
    supplier,
    tiers: [
      { min: parseInt(moq), max: Math.ceil(parseInt(moq) * 2.5), price: parseFloat(maxP) },
      { min: Math.ceil(parseInt(moq) * 2.5) + 1, max: null, price: parseFloat(minP) }
    ]
  };

  localProds.unshift(newProd);
  localStorage.setItem('inditrade_products', JSON.stringify(localProds));
  showNotification('Product listed persistently to local catalogue directory!');
  loadAllFeeds();
  return true;
}

async function createRFQ(title, category, quantity, unit, price, desc) {
  if (IS_SERVER_MODE) {
    try {
      const response = await fetch('/api/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, quantity, unit, targetPrice: price, description: desc })
      });
      const data = await response.json();
      if (response.ok) {
        showNotification(data.message);
        fetchRFQs();
        return true;
      } else {
        showNotification(data.error, 'error');
        return false;
      }
    } catch (e) { return createRFQLocal(title, category, quantity, unit, price, desc); }
  } else {
    return createRFQLocal(title, category, quantity, unit, price, desc);
  }
}
function createRFQLocal(title, category, quantity, unit, price, desc) {
  let localRfqs = JSON.parse(localStorage.getItem('inditrade_rfqs'));
  
  const newRfq = {
    id: Date.now(),
    title, category, quantity: parseInt(quantity),
    unit, targetPrice: parseFloat(price),
    buyerName: 'Premium Sourcing Member',
    buyerLocation: 'Gujarat Industrial Area, India',
    datePosted: 'Just now',
    description: desc,
    status: 'Active (0 Bids)',
    bids: []
  };

  localRfqs.unshift(newRfq);
  localStorage.setItem('inditrade_rfqs', JSON.stringify(localRfqs));
  showNotification('Sourcing RFQ Broadcasted to Local Feed!');
  fetchRFQs();
  return true;
}

async function submitBid(rfqId, supplierName, bidPrice, logisticsTerms) {
  if (IS_SERVER_MODE) {
    try {
      const res = await fetch(`/api/rfqs/${rfqId}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierName, bidPrice, logisticsTerms })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message);
        fetchRFQs();
      } else {
        showNotification(data.error, 'error');
      }
    } catch (e) { submitBidLocal(rfqId, supplierName, bidPrice, logisticsTerms); }
  } else {
    submitBidLocal(rfqId, supplierName, bidPrice, logisticsTerms);
  }
}
function submitBidLocal(rfqId, supplierName, bidPrice, logisticsTerms) {
  let localRfqs = JSON.parse(localStorage.getItem('inditrade_rfqs'));
  const rfq = localRfqs.find(r => r.id == rfqId);
  if (rfq) {
    rfq.bids.unshift({
      supplier: supplierName,
      bidPrice: parseFloat(bidPrice),
      date: 'Just now'
    });
    rfq.status = `Active (${rfq.bids.length} Bids)`;
    localStorage.setItem('inditrade_rfqs', JSON.stringify(localRfqs));
    showNotification('Bid Quote registered persistently to Local Sourcing Board!');
    fetchRFQs();
  }
}

async function submitOrder(productId, quantity, buyerState, carrier, paymentMethod, subtotal, tax, freight, total) {
  if (IS_SERVER_MODE) {
    try {
      // Secure API order post
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ productId, quantity }],
          buyerState,
          carrier,
          paymentMethod
        })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message);
        
        // Dynamic supplier workspace redirection based on product's merchant id
        const product = state.products.find(p => p.id === productId);
        if (product) {
          state.activeSupplierId = product.supplier.id;
        }

        loadAllFeeds();
        redirectToSupplierDashboard();
      } else {
        showNotification(data.error, 'error');
      }
    } catch (e) { submitOrderLocal(productId, quantity, buyerState, carrier, paymentMethod, subtotal, tax, freight, total); }
  } else {
    submitOrderLocal(productId, quantity, buyerState, carrier, paymentMethod, subtotal, tax, freight, total);
  }
}
function submitOrderLocal(productId, quantity, buyerState, carrier, paymentMethod, subtotal, tax, freight, total) {
  let localOrders = JSON.parse(localStorage.getItem('inditrade_orders')) || [];
  let localProds = JSON.parse(localStorage.getItem('inditrade_products'));
  let localInquiries = JSON.parse(localStorage.getItem('inditrade_inquiries')) || [];

  const product = localProds.find(p => p.id === productId);
  if (!product) return;

  const orderCode = 'ORD-' + Math.floor(10000 + Math.random() * 90000);

  const newOrder = {
    id: orderCode,
    parentCode: orderCode,
    productName: product.name,
    buyerName: `Verified Sourcing Member (${buyerState})`,
    quantity, subtotal, tax, freight, total,
    status: 'Escrow Funded',
    date: 'Today',
    supplierId: product.supplier.id
  };

  localOrders.unshift(newOrder);
  localStorage.setItem('inditrade_orders', JSON.stringify(localOrders));

  const newInq = {
    id: 'inq_' + Date.now(),
    productName: product.name,
    buyerName: `Order placed via SafeTrade (${paymentMethod})`,
    message: `Wholesale Escrow funding of ₹${total.toLocaleString('en-IN')} verified. Ready for factory dispatch.`,
    date: 'Just now',
    status: 'Unread',
    supplierId: product.supplier.id
  };
  localInquiries.unshift(newInq);
  localStorage.setItem('inditrade_inquiries', JSON.stringify(localInquiries));

  showNotification(`Escrow Funded via ${paymentMethod}. Local Contract Activated!`);
  state.activeSupplierId = product.supplier.id;
  loadAllFeeds();
  redirectToSupplierDashboard();
}

function redirectToSupplierDashboard() {
  setTimeout(() => {
    state.userRole = 'supplier';
    const switchBtn = document.getElementById('role-toggle-btn');
    if (switchBtn) {
      switchBtn.innerText = 'Switch to Buyer Portal';
      switchBtn.style.color = 'var(--primary)';
      switchBtn.style.borderColor = 'var(--primary)';
    }
    const supLink = document.getElementById('supplier-link');
    if (supLink) supLink.style.display = 'flex';
    
    window.location.hash = '#supplier-dashboard';
    renderSupplierDashboard();
  }, 1200);
}

// 5. Client View Renderers
function populateSuppliersDropdown() {
  // Populate listing creator supplier selector
  const selectList = document.getElementById('new-p-supplier-id');
  if (selectList) {
    selectList.innerHTML = '';
    if (state.suppliers.length === 0) {
      selectList.innerHTML = '<option value="">(No registered MSME Suppliers found)</option>';
    } else {
      state.suppliers.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.innerText = `${s.name} (${s.location} - GST: ${s.gstin})`;
        selectList.appendChild(opt);
      });
    }
  }

  // Populate Active Dashboard Session switcher
  const selectSession = document.getElementById('active-supplier-session-select');
  if (selectSession) {
    selectSession.innerHTML = '';
    state.suppliers.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.innerText = `${s.name} (${s.location})`;
      if (s.id == state.activeSupplierId) {
        opt.selected = true;
      }
      selectSession.appendChild(opt);
    });
  }
}

function initRouter() {
  const navigate = () => {
    const hash = window.location.hash || '#home';
    const viewName = hash.replace('#', '');
    
    if (viewName.startsWith('product/')) {
      state.selectedProductId = viewName.split('/')[1];
      state.currentView = 'product-detail';
    } else {
      state.currentView = viewName;
    }
    
    document.querySelectorAll('.view-section').forEach(section => {
      section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${state.currentView}-view`);
    if (targetSection) {
      targetSection.classList.add('active');
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === hash) link.classList.add('active');
    });

    if (state.currentView === 'product-detail') renderProductDetail();
    else if (state.currentView === 'supplier-dashboard') {
      renderSupplierDashboard();
      populateSuppliersDropdown();
    }
    else if (state.currentView === 'home') fetchProducts();
    
    window.scrollTo(0, 0);
  };

  window.addEventListener('hashchange', navigate);
  navigate();
}

function updateHeaderStats() {
  const activeCount = state.rfqs.filter(r => r.status && r.status.includes('Active')).length;
  const countBadge = document.getElementById('header-rfq-count');
  if (countBadge) countBadge.innerText = activeCount;
}

function bindGlobalEvents() {
  document.querySelector('.logo-wrapper').addEventListener('click', () => {
    window.location.hash = '#home';
  });

  const toggleBtn = document.getElementById('role-toggle-btn');
  toggleBtn.addEventListener('click', () => {
    if (state.userRole === 'buyer') {
      state.userRole = 'supplier';
      toggleBtn.innerText = 'Switch to Buyer Portal';
      toggleBtn.style.color = 'var(--primary)';
      toggleBtn.style.borderColor = 'var(--primary)';
      document.getElementById('supplier-link').style.display = 'flex';
      window.location.hash = '#supplier-dashboard';
    } else {
      state.userRole = 'buyer';
      toggleBtn.innerText = 'Supplier Hub';
      toggleBtn.style.color = 'var(--accent)';
      toggleBtn.style.borderColor = 'var(--accent)';
      document.getElementById('supplier-link').style.display = 'none';
      window.location.hash = '#home';
    }
  });

  const searchInput = document.getElementById('global-search');
  const searchBtn = document.getElementById('btn-global-search');
  const hubSelect = document.getElementById('hub-filter-select');

  const executeSearch = () => {
    state.searchQuery = searchInput.value;
    state.selectedHub = hubSelect.value;
    window.location.hash = '#home';
    fetchProducts();
  };

  searchBtn.addEventListener('click', executeSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') executeSearch();
  });
  hubSelect.addEventListener('change', executeSearch);

  // Active Supplier Session selector event listener
  const activeSupplierSelect = document.getElementById('active-supplier-session-select');
  if (activeSupplierSelect) {
    activeSupplierSelect.addEventListener('change', (e) => {
      state.activeSupplierId = parseInt(e.target.value);
      fetchOrders(); // Triggers dashboard fetch scoped by supplier
    });
  }

  const fastRfqForm = document.getElementById('fast-rfq-form');
  if (fastRfqForm) {
    fastRfqForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const product = document.getElementById('fast-rfq-product').value;
      const quantity = document.getElementById('fast-rfq-qty').value;
      const desc = document.getElementById('fast-rfq-desc').value;
      if (!product || !quantity) return;

      await createRFQ(`Need Wholesale Sourcing for ${product}`, 'Textiles & Garments', quantity, 'Units', 0, desc || 'Urgent wholesale supply needed.');
      fastRfqForm.reset();
      setTimeout(() => { window.location.hash = '#rfqs'; }, 1000);
    });
  }

  const fullRfqForm = document.getElementById('full-rfq-form');
  if (fullRfqForm) {
    fullRfqForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('rfq-form-title').value;
      const category = document.getElementById('rfq-form-cat').value;
      const qty = parseInt(document.getElementById('rfq-form-qty').value);
      const unit = document.getElementById('rfq-form-unit').value;
      const price = parseFloat(document.getElementById('rfq-form-price').value);
      const desc = document.getElementById('rfq-form-desc').value;
      
      const success = await createRFQ(title, category, qty, unit, price, desc);
      if (success) fullRfqForm.reset();
    });
  }

  const supplierRegisterForm = document.getElementById('supplier-register-form');
  if (supplierRegisterForm) {
    supplierRegisterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-sup-name').value;
      const location = document.getElementById('reg-sup-location').value;
      const stateName = document.getElementById('reg-sup-state').value;
      const iso = document.getElementById('reg-sup-iso').value;
      const gstin = document.getElementById('reg-sup-gstin').value;

      const success = await registerSupplier(name, location, stateName, gstin, iso);
      if (success) {
        supplierRegisterForm.reset();
        // Set registered supplier as the active simulation session
        state.activeSupplierId = state.suppliers[0].id;
        loadAllFeeds();
      }
    });
  }

  const addProductForm = document.getElementById('supplier-add-product-form');
  if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('new-p-name').value;
      const category = document.getElementById('new-p-cat').value;
      const hub = document.getElementById('new-p-hub').value;
      const moq = parseInt(document.getElementById('new-p-moq').value);
      const unit = document.getElementById('new-p-unit').value;
      const priceMin = parseFloat(document.getElementById('new-p-price-min').value);
      const priceMax = parseFloat(document.getElementById('new-p-price-max').value);
      const hsn = document.getElementById('new-p-hsn').value;
      const weight = parseFloat(document.getElementById('new-p-weight').value);
      const desc = document.getElementById('new-p-desc').value;
      const supplierId = document.getElementById('new-p-supplier-id').value;

      if (!supplierId) {
        showNotification('Register or select a Supplier entity profile first.', 'error');
        return;
      }

      const success = await createProduct(name, category, hub, weight, moq, unit, priceMax, priceMin, hsn, desc, supplierId);
      if (success) {
        addProductForm.reset();
        // Set the active session to match the listing supplier
        state.activeSupplierId = parseInt(supplierId);
        loadAllFeeds();
      }
    });
  }

  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal();
  });
}

function renderHubs() {
  const container = document.getElementById('sourcing-hubs-grid');
  if (!container) return;
  container.innerHTML = '';
  state.hubs.forEach(hub => {
    const card = document.createElement('div');
    card.className = 'hub-card';
    card.innerHTML = `
      <div class="hub-icon-wrapper">${hub.icon}</div>
      <h3 class="hub-name">${hub.name}</h3>
      <div class="hub-location">
        <svg style="width: 12px; height: 12px; fill:currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        ${hub.location}
      </div>
      <div class="hub-stats-badge">${hub.count}</div>
    `;
    card.addEventListener('click', () => {
      document.getElementById('hub-filter-select').value = hub.id;
      state.selectedHub = hub.id;
      fetchProducts();
      document.getElementById('products-section-header').scrollIntoView({ behavior: 'smooth' });
    });
    container.appendChild(card);
  });
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (state.products.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:4rem; color:var(--text-secondary); border:1px dashed var(--border); border-radius:var(--radius-md)">
        No ex-factory listings match these filters.
      </div>
    `;
    return;
  }

  state.products.forEach(p => {
    const priceMin = p.tiers[p.tiers.length - 1].price;
    const priceMax = p.tiers[0].price;
    const formattedPrice = priceMin === priceMax ? `₹${priceMin}` : `₹${priceMin} - ₹${priceMax}`;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img-wrapper">
        <img class="product-img" src="${p.image}" alt="${p.name}">
        ${p.supplier.verified ? `<div class="badge-verification"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg> GST Verified</div>` : ''}
        <div class="product-hub-tag">${state.hubs.find(h => h.id === p.hub)?.name || 'Direct Sourced'}</div>
      </div>
      <div class="product-info">
        <h4 class="product-name" title="${p.name}">${p.name}</h4>
        <div class="product-price-range">${formattedPrice} <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal">/ ${p.unit}</span></div>
        <div class="product-moq">Min Order: <span>${p.moq} ${p.unit}</span></div>
        <div class="product-supplier">
          <div class="supplier-compact">
            <span class="sup-name">${p.supplier.name}</span>
            <span class="sup-loc">${p.supplier.location}</span>
          </div>
          <div class="trust-badge">${p.supplier.trustScore || '95%'} Trust</div>
        </div>
      </div>
    `;
    card.addEventListener('click', () => { window.location.hash = `#product/${p.id}`; });
    grid.appendChild(card);
  });
}

function renderProductDetail() {
  const p = state.products.find(prod => prod.id === state.selectedProductId);
  const container = document.getElementById('product-detail-view');
  if (!p || !container) return;

  container.innerHTML = `
    <div style="margin-bottom: 1.5rem">
      <a href="#home" style="color: var(--accent); font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 0.25rem">
        <svg style="width:16px; height:16px; fill:currentColor" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        Back to Global Sourcing Marketplace
      </a>
    </div>

    <div class="product-details-grid">
      <div class="product-detail-images">
        <div class="main-detail-img-box">
          <img class="main-detail-img" id="detail-main-img" src="${p.image}">
        </div>
        <div class="thumbnail-row">
          ${p.images.map((imgUrl, i) => `
            <div class="thumb-box ${i === 0 ? 'active' : ''}" onclick="document.getElementById('detail-main-img').src='${imgUrl}'; document.querySelectorAll('.thumb-box').forEach(b => b.classList.remove('active')); this.classList.add('active');">
              <img class="thumb-img" src="${imgUrl}">
            </div>
          `).join('')}
        </div>
      </div>

      <div class="product-detail-meta">
        <div class="detail-supplier-header">
          <span style="color: var(--primary); font-weight: 700; text-transform: uppercase; font-size: 0.8rem; background: rgba(var(--primary-rgb), 0.1); padding: 0.25rem 0.6rem; border-radius: var(--radius-sm)">${p.category}</span>
          ${p.supplier.verified ? `<span class="badge-verification" style="position:static"><svg viewBox="0 0 24 24" style="width:12px; height:12px"><path fill="var(--success)" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg> GST Registered</span>` : ''}
        </div>
        <h1 class="detail-title">${p.name}</h1>
        
        <div class="hsn-badge">
          HSN Code: <span>${p.hsn}</span> | Hub: <span>${state.hubs.find(h => h.id === p.hub)?.name || 'Direct Sourced'}</span>
        </div>

        <div class="tier-pricing-box">
          <h4 class="tier-title">Wholesale Tiered Prices</h4>
          <div class="tiers-flex">
            ${p.tiers.map((t, idx) => `
              <div class="tier-item ${idx === 0 ? 'active' : ''}" id="tier-box-${idx}">
                <div class="tier-range">${t.min}${t.max ? `-${t.max}` : '+'} ${p.unit}</div>
                <div class="tier-price">₹${t.price}</div>
                <div class="tier-unit">Per ${p.unit}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="supplier-card-box">
          <h4 style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; justify-content: space-between">
            ${p.supplier.name}
            <span style="font-size: 0.75rem; background: rgba(var(--accent-rgb), 0.1); color: var(--accent); padding: 0.2rem 0.5rem; border-radius: var(--radius-sm)">${p.supplier.trustScore || '96%'} Trust Score</span>
          </h4>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem">${p.supplier.joined || 'MSME Mill'} | ${p.supplier.iso || 'Verified MSME'}</p>
          
          <div class="supplier-grid">
            <div>
              <div class="sup-stat-label">GSTIN / Tax ID</div>
              <div class="sup-stat-val" style="color:var(--success)">${p.supplier.gstin} (Verified)</div>
            </div>
            <div>
              <div class="sup-stat-label">Avg Response</div>
              <div class="sup-stat-val">${p.supplier.responseTime || '< 2 Hours'}</div>
            </div>
            <div>
              <div class="sup-stat-label">Factory Location</div>
              <div class="sup-stat-val">${p.supplier.location}</div>
            </div>
            <div>
              <div class="sup-stat-label">Logistics Partners</div>
              <div class="sup-stat-val" style="font-size:0.75rem">TCI, Delhivery, V-Trans</div>
            </div>
          </div>
        </div>

        <div class="b2b-calc-box">
          <div class="calc-row">
            <span class="calc-label">Specify Order Quantity:</span>
            <div class="quantity-stepper">
              <div class="step-btn" id="qty-minus">-</div>
              <input class="qty-input" type="number" id="detail-qty-input" value="${p.moq}" min="${p.moq}">
              <div class="step-btn" id="qty-plus">+</div>
            </div>
          </div>
          
          <div class="calc-total-box">
            <div>
              <div class="total-title">Est. Subtotal (Excl. GST & Freight)</div>
              <div class="lead-time-lbl" id="detail-leadtime-lbl">Lead Time: ${p.leadTime}</div>
            </div>
            <div class="total-price" id="calc-total-price">₹${(p.tiers[0].price * p.moq).toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div class="action-buttons-row">
          <button class="btn-primary" style="flex:1; justify-content:center" id="btn-request-quote">Request B2B Quote & GST Invoice</button>
          <button class="btn-contact-whatsapp" id="btn-whatsapp-chat">Contact Sourcing Head</button>
        </div>
      </div>
    </div>

    <div style="border-top:1px solid var(--border); padding-top:2.5rem; margin-top:2.5rem">
      <h3 style="font-size:1.5rem; margin-bottom:1rem">Detailed Sourcing Technical Specs</h3>
      <table style="width:100%; border-collapse: collapse; text-align: left; font-size:0.9rem">
        <tr style="border-bottom:1px solid var(--border-light)">
          <th style="padding: 1rem; color:var(--text-secondary)">Lead HSN Category</th>
          <td style="padding: 1rem">${p.category} Products</td>
        </tr>
        <tr style="border-bottom:1px solid var(--border-light)">
          <th style="padding: 1rem; color:var(--text-secondary)">Standard Port of Dispatch</th>
          <td style="padding: 1rem">JNPT (Mumbai) / Mundra Port / Chennai Port (depending on hub)</td>
        </tr>
        <tr style="border-bottom:1px solid var(--border-light)">
          <th style="padding: 1rem; color:var(--text-secondary)">Unit Sizing & Weight</th>
          <td style="padding: 1rem">${p.weightPerUnit} kg per single wholesale ${p.unit}</td>
        </tr>
        <tr style="border-bottom:1px solid var(--border-light)">
          <th style="padding: 1rem; color:var(--text-secondary)">Description</th>
          <td style="padding: 1rem; line-height: 1.7">${p.description}</td>
        </tr>
      </table>
    </div>
  `;

  const qtyInput = document.getElementById('detail-qty-input');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');
  const calcTotal = document.getElementById('calc-total-price');
  const leadTimeLbl = document.getElementById('detail-leadtime-lbl');

  const recalculatePrice = () => {
    let qty = parseInt(qtyInput.value);
    if (isNaN(qty) || qty < p.moq) {
      qty = p.moq;
      qtyInput.value = qty;
    }

    let unitPrice = p.tiers[0].price;
    let activeTierIdx = 0;
    
    p.tiers.forEach((t, i) => {
      if (qty >= t.min && (t.max === null || qty <= t.max)) {
        unitPrice = t.price;
        activeTierIdx = i;
      }
    });

    p.tiers.forEach((_, i) => {
      const el = document.getElementById(`tier-box-${i}`);
      if (el) {
        if (i === activeTierIdx) el.classList.add('active');
        else el.classList.remove('active');
      }
    });

    const subtotal = qty * unitPrice;
    calcTotal.innerText = `₹${subtotal.toLocaleString('en-IN')}`;

    if (qty > p.moq * 5) {
      leadTimeLbl.innerText = `Lead Time: Est. 30 days (High-Volume Priority)`;
      leadTimeLbl.style.color = 'var(--primary)';
    } else {
      leadTimeLbl.innerText = `Lead Time: ${p.leadTime}`;
      leadTimeLbl.style.color = 'var(--warning)';
    }
  };

  qtyMinus.addEventListener('click', () => {
    let val = parseInt(qtyInput.value);
    if (val > p.moq) {
      qtyInput.value = val - 10;
      recalculatePrice();
    }
  });

  qtyPlus.addEventListener('click', () => {
    let val = parseInt(qtyInput.value);
    qtyInput.value = val + 10;
    recalculatePrice();
  });

  qtyInput.addEventListener('input', recalculatePrice);

  document.getElementById('btn-request-quote').addEventListener('click', () => {
    openCheckoutModal(p, parseInt(qtyInput.value));
  });

  document.getElementById('btn-whatsapp-chat').addEventListener('click', () => {
    openWhatsAppSimulation(p);
  });
}

function renderRFQs() {
  const container = document.getElementById('rfq-marketplace-feed');
  if (!container) return;
  container.innerHTML = '';

  state.rfqs.forEach(rfq => {
    const card = document.createElement('div');
    card.className = 'rfq-card';
    card.innerHTML = `
      <div class="rfq-header-row">
        <div>
          <div class="rfq-tag-row">
            <span class="rfq-badge">${rfq.category}</span>
            <span class="rfq-badge status">${rfq.status}</span>
          </div>
          <h3 class="rfq-title">${rfq.title}</h3>
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted)">Posted ${rfq.datePosted}</div>
      </div>
      <p class="rfq-desc">${rfq.description}</p>
      
      <div class="rfq-meta-grid">
        <div>
          <div class="rfq-meta-label">Quantity Required</div>
          <div class="rfq-meta-value">${rfq.quantity.toLocaleString('en-IN')} ${rfq.unit}</div>
        </div>
        <div>
          <div class="rfq-meta-label">Target Unit Price</div>
          <div class="rfq-meta-value price">${rfq.targetPrice > 0 ? `₹${rfq.targetPrice}` : 'Open to bids'}</div>
        </div>
        <div>
          <div class="rfq-meta-label">Buyer Location</div>
          <div class="rfq-meta-value">${rfq.buyerLocation}</div>
        </div>
      </div>
      <button class="rfq-bid-btn" id="btn-bid-${rfq.id}">Submit Supplier Quote Bid</button>

      ${rfq.bids.length > 0 ? `
        <div style="margin-top:1rem; background:rgba(255,255,255,0.01); border:1px solid var(--border-light); border-radius:var(--radius-sm); padding:0.75rem">
          <div style="font-size:0.75rem; font-weight:700; color:var(--text-secondary); margin-bottom:0.5rem">Active Bids:</div>
          ${rfq.bids.map(b => `
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.25rem">
              <span style="color:var(--accent)">✓ ${b.supplier}</span>
              <span style="font-weight:600">₹${b.bidPrice} / ${rfq.unit} (${b.date})</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
    container.appendChild(card);
    document.getElementById(`btn-bid-${rfq.id}`).addEventListener('click', () => { openBidModal(rfq); });
  });
}

function renderSupplierDashboard() {
  // Filter products by active supplier simulator ID
  const supplierProds = state.products.filter(p => p.supplier && p.supplier.id == state.activeSupplierId);

  const prodTableBody = document.getElementById('supplier-product-table-body');
  if (prodTableBody) {
    prodTableBody.innerHTML = '';
    supplierProds.forEach(p => {
      const priceMin = p.tiers[p.tiers.length - 1].price;
      const priceMax = p.tiers[0].price;
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid var(--border-light)';
      row.innerHTML = `
        <td style="padding:1rem; font-weight:600">${p.name}</td>
        <td style="padding:1rem">${p.category}</td>
        <td style="padding:1rem; color:var(--primary); font-weight:700">₹${priceMin} - ₹${priceMax}</td>
        <td style="padding:1rem">${p.moq} ${p.unit}</td>
        <td style="padding:1rem"><span style="background:var(--success-bg); color:var(--success); font-size:0.75rem; font-weight:600; padding:0.2rem 0.5rem; border-radius:var(--radius-sm)">Live</span></td>
      `;
      prodTableBody.appendChild(row);
    });
  }

  // Filter inquiries by active supplier
  const supplierInqs = state.inquiries.filter(inq => inq.supplierId == state.activeSupplierId);

  const inquiryList = document.getElementById('supplier-inquiries-list');
  if (inquiryList) {
    inquiryList.innerHTML = '';
    if (supplierInqs.length === 0) {
      inquiryList.innerHTML = `<div style="text-align:center; padding:1.5rem; color:var(--text-muted); font-size:0.85rem">No incoming customer leads.</div>`;
    } else {
      supplierInqs.forEach(inq => {
        const el = document.createElement('div');
        el.style.background = 'rgba(255,255,255,0.02)';
        el.style.border = '1px solid var(--border)';
        el.style.borderRadius = 'var(--radius-sm)';
        el.style.padding = '1rem';
        el.style.marginBottom = '0.75rem';
        el.innerHTML = `
          <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem">
            <span style="font-size:0.8rem; color:var(--accent); font-weight:700">${inq.buyerName}</span>
            <span style="font-size:0.7rem; color:var(--text-muted)">${inq.date}</span>
          </div>
          <div style="font-weight:600; font-size:0.9rem; margin-bottom:0.25rem">Inquiry on: ${inq.productName}</div>
          <p style="font-size:0.85rem; color:var(--text-secondary); font-style:italic">"${inq.message}"</p>
          <div style="margin-top:0.75rem; display:flex; gap:0.5rem; justify-content:flex-end">
            <button class="btn-secondary" style="padding:0.3rem 0.75rem; font-size:0.75rem; border-radius:var(--radius-sm)" onclick="simulateInquiryReply('${inq.id}')">Reply / Send Quote</button>
          </div>
        `;
        inquiryList.appendChild(el);
      });
    }
  }

  // Active supplier sub-orders list (secured by active supplier ID)
  const orderListContainer = document.getElementById('supplier-orders-feed');
  if (orderListContainer) {
    orderListContainer.innerHTML = '';
    if (state.orders.length === 0) {
      orderListContainer.innerHTML = `<div style="text-align:center; padding:1.5rem; color:var(--text-muted); font-size:0.85rem">No active B2B orders yet.</div>`;
    } else {
      state.orders.forEach(o => {
        const orderDiv = document.createElement('div');
        orderDiv.style.background = 'rgba(255,255,255,0.01)';
        orderDiv.style.border = '1px solid var(--border)';
        orderDiv.style.borderRadius = 'var(--radius-sm)';
        orderDiv.style.padding = '1rem';
        orderDiv.style.marginBottom = '0.75rem';
        orderDiv.innerHTML = `
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; border-bottom:1px solid var(--border-light); padding-bottom:0.25rem">
            <span style="font-weight:700; color:var(--accent)">${o.orderCode || o.id}</span>
            <span style="background:var(--success-bg); color:var(--success); font-size:0.7rem; font-weight:700; padding:0.15rem 0.4rem; border-radius:var(--radius-sm)">${o.status}</span>
          </div>
          <div style="font-size:0.85rem; font-weight:600; margin-bottom:0.25rem">${o.productName}</div>
          <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.5rem">Buyer: ${o.buyerName} | Qty: ${o.quantity} units</div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); font-size:0.75rem; color:var(--text-muted)">
            <div>Subtotal: ₹${o.subtotal.toLocaleString('en-IN')}</div>
            <div>GST: ₹${o.tax.toLocaleString('en-IN')}</div>
            <div>Freight: ₹${o.freight.toLocaleString('en-IN')}</div>
          </div>
          <div style="margin-top:0.5rem; display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap">
            <span style="font-weight:700; font-family:var(--font-display); color:var(--primary); font-size:0.9rem">Total: ₹${o.total.toLocaleString('en-IN')}</span>
            <div style="display:flex; gap:0.4rem">
              <button class="btn-secondary" style="padding:0.25rem 0.6rem; font-size:0.7rem; border-radius:var(--radius-sm); border:1px solid var(--border)" onclick="showB2bInvoiceReceipt('${o.id || o.orderCode}')">Invoice Receipt</button>
              <button class="btn-primary" style="padding:0.25rem 0.6rem; font-size:0.7rem; border-radius:var(--radius-sm)" onclick="showNotification('SafeTrade Escrow verified. Dispatching goods via logistics cluster.')">Dispatch Goods</button>
            </div>
          </div>
        `;
        orderListContainer.appendChild(orderDiv);
      });
    }
  }

  const salesVal = document.getElementById('dash-total-sales');
  if (salesVal) {
    const totalEarnings = state.orders.reduce((sum, o) => sum + o.total, 0);
    salesVal.innerText = `₹${(totalEarnings / 100000).toFixed(2)} Lakhs`;
  }
}

function openCheckoutModal(product, quantity) {
  const modal = document.getElementById('global-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.innerText = `B2B Checkout & GST Invoice Draft`;

  let unitPrice = product.tiers[0].price;
  product.tiers.forEach(t => {
    if (quantity >= t.min && (t.max === null || quantity <= t.max)) {
      unitPrice = t.price;
    }
  });

  const subtotal = quantity * unitPrice;
  const weight = product.weightPerUnit || 1;
  const totalWeight = weight * quantity;
  const supplierState = product.supplier.state || 'Gujarat';

  modalBody.innerHTML = `
    <div style="max-height:500px; overflow-y:auto; padding-right:0.5rem">
      <div style="background:var(--bg-tertiary); border:1px solid var(--border); border-radius:var(--radius-sm); padding:1rem; margin-bottom:1rem; font-size:0.85rem">
        <strong>Manufacturer:</strong> ${product.supplier.name}<br>
        <strong>Wholesale Item:</strong> ${product.name} | <strong>Qty:</strong> ${quantity} ${product.unit}<br>
        <strong>Total Cargo Weight:</strong> ${totalWeight.toFixed(1)} kg
      </div>

      <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:1rem; margin-bottom:1rem">
        <div class="form-group">
          <label class="form-label">Select Your State (Tax Calc)</label>
          <div class="form-input-wrapper">
            <select class="form-select" id="checkout-buyer-state" style="padding:0.6rem">
              <option value="Maharashtra">Maharashtra (Interstate)</option>
              <option value="Gujarat" ${supplierState === 'Gujarat' ? 'selected' : ''}>Gujarat</option>
              <option value="Tamil Nadu" ${supplierState === 'Tamil Nadu' ? 'selected' : ''}>Tamil Nadu</option>
              <option value="Uttar Pradesh" ${supplierState === 'Uttar Pradesh' ? 'selected' : ''}>Uttar Pradesh</option>
              <option value="Assam" ${supplierState === 'Assam' ? 'selected' : ''}>Assam</option>
              <option value="Delhi">Delhi (Interstate)</option>
              <option value="Karnataka">Karnataka (Interstate)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Carrier Partner</label>
          <div class="form-input-wrapper">
            <select class="form-select" id="checkout-carrier" style="padding:0.6rem">
              <option value="vtrans">V-Trans (Road - ₹6/kg)</option>
              <option value="delhivery">Delhivery (Express - ₹18/kg)</option>
              <option value="tci">TCI (Freight - ₹4/kg)</option>
            </select>
          </div>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.01); border:1px solid var(--border); border-radius:var(--radius-sm); padding:1.25rem; font-size:0.85rem; margin-bottom:1.5rem">
        <h4 style="font-weight:700; color:var(--text-secondary); border-bottom:1px solid var(--border-light); padding-bottom:0.5rem; margin-bottom:0.75rem">Commercial Tax Invoice</h4>
        <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem">
          <span>Subtotal Ex-Factory</span>
          <span style="font-weight:600">₹${subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div id="checkout-tax-row" style="display:flex; justify-content:space-between; margin-bottom:0.4rem; color:var(--text-secondary)"></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; color:var(--text-secondary)">
          <span>Carriage Cost (<span id="invoice-weight-lbl">0</span> kg)</span>
          <span style="font-weight:600" id="invoice-freight-val">₹0</span>
        </div>
        <div style="border-top:1px solid var(--border); padding-top:0.75rem; margin-top:0.75rem; display:flex; justify-content:space-between; font-weight:800; font-family:var(--font-display); font-size:1.15rem">
          <span>Grand Contract Total</span>
          <span style="color:var(--primary)" id="invoice-grand-total">₹0</span>
        </div>
      </div>

      <div class="form-group" style="margin-bottom:1.5rem">
        <label class="form-label">SafeTrade Escrow Payment Method</label>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem">
          <label style="background:var(--bg-tertiary); border:1px solid var(--border); padding:0.6rem; border-radius:var(--radius-sm); text-align:center; font-size:0.75rem; cursor:pointer; display:block">
            <input type="radio" name="payment-method" value="neft" checked style="margin-bottom:0.25rem; display:block; margin-left:auto; margin-right:auto">NEFT / RTGS
          </label>
          <label style="background:var(--bg-tertiary); border:1px solid var(--border); padding:0.6rem; border-radius:var(--radius-sm); text-align:center; font-size:0.75rem; cursor:pointer; display:block">
            <input type="radio" name="payment-method" value="upi" style="margin-bottom:0.25rem; display:block; margin-left:auto; margin-right:auto">UPI Business
          </label>
          <label style="background:var(--bg-tertiary); border:1px solid var(--border); padding:0.6rem; border-radius:var(--radius-sm); text-align:center; font-size:0.75rem; cursor:pointer; display:block">
            <input type="radio" name="payment-method" value="lc" style="margin-bottom:0.25rem; display:block; margin-left:auto; margin-right:auto">Letter of Credit
          </label>
        </div>
      </div>

      <button class="btn-primary" style="width:100%; justify-content:center; padding:0.9rem" id="btn-submit-escrow-payment">Fund SafeTrade Escrow & Contract Place</button>
    </div>
  `;

  modal.classList.add('active');

  const buyerStateSelect = document.getElementById('checkout-buyer-state');
  const carrierSelect = document.getElementById('checkout-carrier');
  
  const updateInvoiceValues = () => {
    const selectedState = buyerStateSelect.value;
    const carrier = carrierSelect.value;

    let gstTax = subtotal * 0.18;
    let gstHtml = '';
    if (selectedState === supplierState) {
      const cgst = subtotal * 0.09;
      const sgst = subtotal * 0.09;
      gstHtml = `<span>CGST (9%) + SGST (9%) (Intrastate)</span><span style="font-weight:600">₹${cgst.toLocaleString('en-IN')} + ₹${sgst.toLocaleString('en-IN')}</span>`;
    } else {
      gstHtml = `<span>IGST (18%) (Interstate to ${selectedState})</span><span style="font-weight:600">₹${gstTax.toLocaleString('en-IN')}</span>`;
    }
    document.getElementById('checkout-tax-row').innerHTML = gstHtml;

    let rate = 6;
    if (carrier === 'delhivery') rate = 18;
    else if (carrier === 'tci') rate = 4;

    const freightCost = Math.ceil(totalWeight * rate);
    document.getElementById('invoice-weight-lbl').innerText = totalWeight.toLocaleString('en-IN');
    document.getElementById('invoice-freight-val').innerText = `₹${freightCost.toLocaleString('en-IN')}`;

    const grandTotal = subtotal + gstTax + freightCost;
    document.getElementById('invoice-grand-total').innerText = `₹${grandTotal.toLocaleString('en-IN')}`;

    return { subtotal, gstTax, freightCost, grandTotal, selectedState };
  };

  buyerStateSelect.addEventListener('change', updateInvoiceValues);
  carrierSelect.addEventListener('change', updateInvoiceValues);

  let invoiceData = updateInvoiceValues();

  document.getElementById('btn-submit-escrow-payment').addEventListener('click', async () => {
    const paymentMethodVal = document.querySelector('input[name="payment-method"]:checked').value.toUpperCase();
    const carrierVal = carrierSelect.value;
    const buyerStateVal = buyerStateSelect.value;

    await submitOrder(
      product.id, quantity, buyerStateVal, carrierVal, paymentMethodVal,
      invoiceData.subtotal, invoiceData.gstTax, invoiceData.freightCost, invoiceData.grandTotal
    );
    closeModal();
  });
}

function openWhatsAppSimulation(product) {
  const modal = document.getElementById('global-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.innerText = `WhatsApp Connect - ${product.supplier.name}`;
  modalBody.innerHTML = `
    <div style="display:flex; align-items:center; gap:0.5rem; background:#128c7e; padding:1rem; border-top-left-radius:var(--radius-sm); border-top-right-radius:var(--radius-sm); font-size:0.9rem">
      <div style="width:10px; height:10px; border-radius:50%; background:#00ff00"></div>
      <strong>${product.supplier.name} Sourcing Head</strong>
    </div>
    
    <div class="chat-history" id="whatsapp-chat-history">
      <div class="chat-bubble supplier">
        Hello! Thank you for showing interest in our wholesale items from ${state.hubs.find(h => h.id === product.hub)?.name || 'our factory'}. How can we assist your business today?
        <div class="chat-bubble-time">11:32 AM</div>
      </div>
    </div>

    <div style="display:flex; gap:0.5rem">
      <input type="text" class="form-input" id="whatsapp-chat-input" placeholder="Type a message to supplier..." style="background:var(--bg-tertiary); border:1px solid var(--border); border-radius:var(--radius-sm); padding:0.6rem; flex:1">
      <button class="btn-primary" id="whatsapp-send-btn" style="padding:0.6rem 1.25rem; font-size:0.85rem">Send</button>
    </div>
  `;

  modal.classList.add('active');

  const chatInput = document.getElementById('whatsapp-chat-input');
  const sendBtn = document.getElementById('whatsapp-send-btn');
  const chatHist = document.getElementById('whatsapp-chat-history');

  const sendMessage = () => {
    const text = chatInput.value;
    if (!text) return;

    const bBubble = document.createElement('div');
    bBubble.className = 'chat-bubble buyer';
    bBubble.innerHTML = `${text}<div class="chat-bubble-time">Just now</div>`;
    chatHist.appendChild(bBubble);
    chatHist.scrollTop = chatHist.scrollHeight;
    chatInput.value = '';

    setTimeout(() => {
      const sBubble = document.createElement('div');
      sBubble.className = 'chat-bubble supplier';
      sBubble.innerHTML = `Understood. Let me connect you with our accounts team to draft the commercial invoice with freight rates. Could share your business card / GSTIN number for custom discounts?<div class="chat-bubble-time">Just now</div>`;
      chatHist.appendChild(sBubble);
      chatHist.scrollTop = chatHist.scrollHeight;
    }, 1500);
  };

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
}

function openBidModal(rfq) {
  const modal = document.getElementById('global-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.innerText = `Submit Supplier Quote Bid`;
  modalBody.innerHTML = `
    <form id="bid-submit-form">
      <div style="background:var(--bg-tertiary); padding:1rem; border-radius:var(--radius-sm); margin-bottom:1rem; font-size:0.85rem">
        <strong>Buyer Requirement:</strong> ${rfq.title}<br>
        <strong>Qty:</strong> ${rfq.quantity} ${rfq.unit} | <strong>Target Price:</strong> ₹${rfq.targetPrice}/${rfq.unit}
      </div>
      
      <div class="form-group">
        <label class="form-label">Your Bid Price (Per ${rfq.unit})</label>
        <div class="form-input-wrapper">
          <span class="form-prefix">₹</span>
          <input type="number" class="form-input" id="bid-input-price" step="0.01" value="${rfq.targetPrice > 0 ? rfq.targetPrice - 5 : 100}" required>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Lead Time & Logistics Terms</label>
        <input type="text" class="form-input" id="bid-input-logistics" value="Ready stock, 7 days dispatch via V-Trans transport" required>
      </div>

      <button class="btn-primary" style="width:100%; justify-content:center" type="submit">Submit Binding B2B Bid</button>
    </form>
  `;

  modal.classList.add('active');

  document.getElementById('bid-submit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const bidPrice = document.getElementById('bid-input-price').value;
    const logistics = document.getElementById('bid-input-logistics').value;
    
    await submitBid(rfq.id, 'Morbi Ceramics & Sourcing Co.', bidPrice, logistics);
    closeModal();
  });
}

function closeModal() {
  document.getElementById('global-modal').classList.remove('active');
}

window.simulateInquiryReply = function(inquiryId) {
  const inquiry = state.inquiries.find(i => i.id === inquiryId);
  if (!inquiry) return;

  const modal = document.getElementById('global-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.innerText = `Reply Sourcing Inquiry - ${inquiry.buyerName}`;
  modalBody.innerHTML = `
    <form id="supplier-reply-form">
      <div style="background:var(--bg-tertiary); padding:1rem; border-radius:var(--radius-sm); margin-bottom:1rem; font-size:0.85rem">
        <strong>From:</strong> ${inquiry.buyerName}<br>
        <strong>Inquiry Details:</strong> "${inquiry.message}"
      </div>
      <div class="form-group">
        <label class="form-label">Compose Commercial Quotation / Reply</label>
        <textarea class="form-input form-textarea" id="sup-reply-text" required>Hi, thank you for reaching out. Yes, we can fulfill this order. For custom logistics details, we have verified Delhivery / FTL transport parameters. Our discounted ex-factory wholesale price will be approved, and the commercial invoice and transit slip are ready. Let us know if we can initiate carriage loading.</textarea>
      </div>
      <button class="btn-primary" style="width:100%; justify-content:center" type="submit">Send Commercial Reply</button>
    </form>
  `;

  modal.classList.add('active');

  document.getElementById('supplier-reply-form').addEventListener('submit', (e) => {
    e.preventDefault();
    inquiry.status = 'Replied';
    closeModal();
    showNotification('Quotation and Commercial reply sent successfully to ' + inquiry.buyerName);
    renderSupplierDashboard();
  });
};

function showNotification(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '2rem';
  toast.style.right = '2rem';
  toast.style.background = type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : 'var(--accent)';
  toast.style.color = '#ffffff';
  toast.style.padding = '1rem 1.5rem';
  toast.style.borderRadius = 'var(--radius-md)';
  toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
  toast.style.zIndex = '9999';
  toast.style.fontFamily = 'var(--font-display)';
  toast.style.fontWeight = '600';
  toast.style.fontSize = '0.9rem';
  toast.style.animation = 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
  
  toast.innerText = message;
  document.body.appendChild(toast);

  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.innerHTML = `
      @keyframes slideIn {
        from { transform: translateX(100%) translateY(0); opacity: 0; }
        to { transform: translateX(0) translateY(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    setTimeout(() => { toast.remove(); }, 300);
  }, 4000);
}

// B2B printable SafeTrade escrow invoice receipt popup
window.showB2bInvoiceReceipt = function(orderId) {
  const allOrders = JSON.parse(localStorage.getItem('inditrade_orders')) || SEED_ORDERS;
  const o = allOrders.find(order => order.id == orderId || order.orderCode == orderId);
  if (!o) {
    showNotification('Order not found for invoice mapping', 'error');
    return;
  }

  // Find linked supplier from suppliers list
  const suppliers = JSON.parse(localStorage.getItem('inditrade_suppliers')) || SEED_SUPPLIERS;
  const supplier = suppliers.find(s => s.id == o.supplierId) || SEED_SUPPLIERS[0];

  const modal = document.getElementById('global-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.innerText = `Commercial B2B Invoice Receipt`;
  modalBody.innerHTML = `
    <div class="invoice-modal" style="padding:1.5rem">
      <div class="invoice-header">
        <div>
          <h2 class="invoice-title">INDITRADE SAFETRADE</h2>
          <span style="font-size:0.7rem; color:#64748b">Verified wholesale escrow transaction contract</span>
        </div>
        <div class="invoice-badge-verified">
          <svg style="width:12px; height:12px; fill:currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          SafeTrade Secured
        </div>
      </div>

      <div class="invoice-details-grid">
        <div class="invoice-col">
          <div class="invoice-col-title">Seller / MSME Manufacturer</div>
          <strong>${supplier.name}</strong><br>
          GSTIN: ${supplier.gstin}<br>
          Location: ${supplier.location} (${supplier.state || 'Gujarat'})<br>
          Compliance: ${supplier.iso || 'ISO Certified'}
        </div>
        <div class="invoice-col">
          <div class="invoice-col-title">Wholesale Escrow Contract Ledger</div>
          <strong>Invoice Code:</strong> ${o.orderCode || o.id}<br>
          <strong>Buyer Info:</strong> ${o.buyerName}<br>
          <strong>Escrow Status:</strong> Funded & Escrow Held<br>
          <strong>Date Created:</strong> ${o.date || 'Today'}
        </div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th>Wholesale Catalog Listing</th>
            <th>MOQ Sizing</th>
            <th>Wholesale Unit Price</th>
            <th style="text-align:right">Subtotal Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${o.productName}</strong><br>
              <span style="font-size:0.7rem; color:#64748b">Tax Category: Standard 18% GST (under HSN code classification)</span>
            </td>
            <td>${o.quantity.toLocaleString('en-IN')} units</td>
            <td>₹${Math.round(o.subtotal / o.quantity).toLocaleString('en-IN')}</td>
            <td style="text-align:right; font-weight:600">₹${o.subtotal.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <div class="invoice-totals">
        <div class="invoice-total-row">
          <span>Subtotal Ex-Factory:</span>
          <span>₹${o.subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div class="invoice-total-row">
          <span>CGST (9%) + SGST (9%) or IGST (18%):</span>
          <span>₹${o.tax.toLocaleString('en-IN')}</span>
        </div>
        <div class="invoice-total-row">
          <span>Weight Logistics Sizing:</span>
          <span>₹${o.freight.toLocaleString('en-IN')}</span>
        </div>
        <div class="invoice-total-row invoice-grand-total">
          <span>Grand Invoice Total:</span>
          <span>₹${o.total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div style="margin-top:1.5rem; display:flex; gap:0.5rem; justify-content:flex-end">
        <button class="btn-primary" style="background:#475569; padding:0.4rem 1rem; font-size:0.75rem; border-radius:var(--radius-sm)" onclick="window.print()">Print Proforma Receipt</button>
        <button class="btn-primary" style="padding:0.4rem 1rem; font-size:0.75rem; border-radius:var(--radius-sm)" onclick="closeModal()">Close Details</button>
      </div>

      <div class="invoice-footer">
        Thank you for sourcing via IndiTrade - Connecting Mega Manufacturing Hubs in India. Make in India verified.
      </div>
    </div>
  `;

  modal.classList.add('active');
};

// Sourcing Lead & Customer Inquiry Background Simulator
function initLiveSourcingSimulator() {
  setInterval(() => {
    // 50% chance to trigger a simulator tick
    if (Math.random() > 0.5) return;

    const isRfqTick = Math.random() > 0.5;
    if (isRfqTick) {
      // 1. Generate a new simulated buyer RFQ in the market feed
      let localRfqs = JSON.parse(localStorage.getItem('inditrade_rfqs')) || SEED_RFQS;
      const categories = ['Textiles & Garments', 'Home & Ceramics', 'Hardware & Tools', 'Agriculture & Food'];
      const hubs = ['surat', 'morbi', 'tirupur', 'aligarh', 'assam'];
      const buyerLocations = ['Chennai, Tamil Nadu', 'Hyderabad, Telangana', 'Kolkata, West Bengal', 'Pune, Maharashtra', 'Jaipur, Rajasthan'];
      
      const rfqTitles = {
        'Textiles & Garments': [
          'Sourcing 3,000 meters Premium Cotton fabric',
          'Bulk request for 2,000 Pieces Preshrunk Polo shirts',
          'Need wholesale silk saree designer materials'
        ],
        'Home & Ceramics': [
          'Morbi Double Charge Slabs for Shopping Complex',
          'Need 5,000 Sqm glazed ceramic wall tiles',
          'Bulk supply of vitrified floor tiles for housing society'
        ],
        'Hardware & Tools': [
          'Bulk brass lock units for industrial security setup',
          'Sourcing 10,000 heavy duty steel hinges',
          'Need wholesale premium security locks'
        ],
        'Agriculture & Food': [
          'Assam Green Tea Bulk leaves for processing plant',
          'Bulk CTC Tea boxes sourcing request',
          'Need 1,000 Kg tea estates direct dispatch'
        ]
      };

      const selectedCat = categories[Math.floor(Math.random() * categories.length)];
      const titleOptions = rfqTitles[selectedCat];
      const selectedTitle = titleOptions[Math.floor(Math.random() * titleOptions.length)];
      const quantity = Math.floor(1000 + Math.random() * 9000);
      const targetPrice = Math.floor(80 + Math.random() * 400);

      const simulatedRfq = {
        id: Date.now(),
        title: selectedTitle,
        category: selectedCat,
        quantity,
        unit: selectedCat === 'Home & Ceramics' ? 'Sqm' : selectedCat === 'Textiles & Garments' && selectedTitle.includes('meters') ? 'Meters' : 'Pieces',
        targetPrice,
        buyerName: `Simulated Buyer (${buyerLocations[Math.floor(Math.random() * buyerLocations.length)].split(',')[0]})`,
        buyerLocation: buyerLocations[Math.floor(Math.random() * buyerLocations.length)],
        datePosted: 'Just now',
        description: `Urgent commercial wholesale sourcing requirements. Factory must hold verified GSTIN profile. Escrow safe safe payment funded instantly once commercial invoice finalized.`,
        status: 'Active (0 Bids)',
        bids: []
      };

      localRfqs.unshift(simulatedRfq);
      localStorage.setItem('inditrade_rfqs', JSON.stringify(localRfqs));
      
      showNotification(`📢 Sourcing RFQ Broadcasted: "${selectedTitle}"`, 'warning');
      fetchRFQs();
    } else {
      // 2. Generate a direct Customer Sourcing Inquiry lead for the active supplier!
      let localInquiries = JSON.parse(localStorage.getItem('inditrade_inquiries')) || [];
      let suppliers = JSON.parse(localStorage.getItem('inditrade_suppliers')) || SEED_SUPPLIERS;
      const activeSup = suppliers.find(s => s.id == state.activeSupplierId) || suppliers[0];

      const inquiryMessages = [
        'Hi, we saw your wholesale ex-factory listings. What is the lowest price tier you can offer for double MOQ size?',
        'Hello Sourcing Manager. Please share your factory ISO compliance certificate and MSME registration card.',
        'Requesting commercial carriage shipping details for urgent dispatch of catalog items to Delhi.',
        'Can we request a sample set dispatched to our Mumbai sourcing office before funding the proforma escrow?'
      ];

      const buyerNames = ['Karan Singhal', 'Preeti Constructions', 'Astra Logistics Group', 'Deepak Overseas Ltd'];
      
      const simulatedInq = {
        id: 'inq_' + Date.now(),
        productName: 'Ex-Factory Wholesale Catalog Product',
        buyerName: buyerNames[Math.floor(Math.random() * buyerNames.length)],
        message: inquiryMessages[Math.floor(Math.random() * inquiryMessages.length)],
        date: 'Just now',
        status: 'Unread',
        supplierId: activeSup.id
      };

      localInquiries.unshift(simulatedInq);
      localStorage.setItem('inditrade_inquiries', JSON.stringify(localInquiries));
      
      showNotification(`📩 Direct Buyer inquiry Lead received for: ${activeSup.name}`);
      fetchInquiries();
      renderSupplierDashboard();
    }
  }, 45000); // Trigger simulation check every 45 seconds (frequent enough for interactive testing!)
}
