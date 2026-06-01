require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const pinoHttp = require('pino-http');
const logger = require('./config/logger');
const { up: runIndexMigration } = require('./migrations/001_add_indexes');
const { metricsMiddleware, register: prometheusRegister } = require('./config/metrics');
const { captureException } = require('./config/sentry');

// 1. Initialize Sequelize Database
const sequelize = require('./config/database');

// 2. Import Models to register schemas
const User = require('./models/User');
const Supplier = require('./models/Supplier');
const Product = require('./models/Product');
const PriceTier = require('./models/PriceTier');
const Rfq = require('./models/Rfq');
const Bid = require('./models/Bid');
const Order = require('./models/Order');

// 3. Import Controllers
const SupplierController = require('./controllers/SupplierController');
const ProductController = require('./controllers/ProductController');
const RfqController = require('./controllers/RfqController');
const OrderController = require('./controllers/OrderController');
const AuthController = require('./controllers/AuthController');
const BecknController = require('./controllers/BecknController');

// Import Auth Middlewares
const { verifyToken, requireRole } = require('./middlewares/auth');
const { verifyBecknSignature } = require('./middlewares/becknSecurity');

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests, please try again later' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 min
  message: { error: 'Too many login attempts, please try again later' }
});

const app = express();
const PORT = process.env.PORT || 8000;

// ── Trust the first proxy (Docker/Nginx) so rate-limiter sees real client IPs ──
app.set('trust proxy', 1);

// ── Security headers via Helmet ──────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],   // Swagger UI inline scripts
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false // allow Swagger UI to load
}));

// ── Structured HTTP request logging ─────────────────────────────────────────
app.use(pinoHttp({ logger }));
app.use(metricsMiddleware);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:80',
      'http://localhost',
      'http://127.0.0.1:3000',
      'http://127.0.0.1',
    ];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json({ 
  limit: '1mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use('/api/v1/', limiter);

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// 4. API Endpoints routed to Controllers
// Hubs Endpoint
app.get('/api/v1/hubs', (req, res) => {
  const hubs = [
    { id: 'surat', name: 'Surat Textile Hub', location: 'Gujarat', category: 'Textiles & Apparel', count: '1,420+ Mills', icon: '🧵' },
    { id: 'morbi', name: 'Morbi Ceramic Hub', location: 'Gujarat', category: 'Building Materials', count: '850+ Factories', icon: '🧱' },
    { id: 'tirupur', name: 'Tirupur Garment Cluster', location: 'Tamil Nadu', category: 'Apparel & Knitwear', count: '1,100+ Manufacturers', icon: '👕' },
    { id: 'aligarh', name: 'Aligarh Hardware Hub', location: 'Uttar Pradesh', category: 'Industrial & Hardware', count: '620+ Units', icon: '🔐' },
    { id: 'assam', name: 'Assam Tea Plantations', location: 'Assam', category: 'Agriculture & Food', count: '340+ Estates', icon: '🍃' },
    { id: 'moradabad', name: 'Moradabad Brassware Hub', location: 'Uttar Pradesh', category: 'Handicrafts & Decor', count: '480+ Artisans', icon: '🏺' }
  ];
  res.json(hubs);
});

// Health Check Endpoint
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (err) {
    logger.error({ msg: 'Health check failed', err: err.message });
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// Prometheus Metrics Scraping Endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', prometheusRegister.contentType);
    res.end(await prometheusRegister.metrics());
  } catch (err) {
    logger.error({ msg: 'Metrics scraping failed', err: err.message });
    res.status(500).end(err.message);
  }
});

// Auth Routes
app.post('/api/v1/auth/register', (req, res) => AuthController.register(req, res));
app.post('/api/v1/auth/login', authLimiter, (req, res) => AuthController.login(req, res));
app.post('/api/v1/auth/logout', (req, res) => AuthController.logout(req, res));
app.get('/api/v1/auth/me', verifyToken, (req, res) => AuthController.getMe(req, res));
app.post('/api/v1/auth/verify-buyer', verifyToken, (req, res) => AuthController.verifyBuyer(req, res));
app.post('/api/v1/auth/seller-step1', verifyToken, (req, res) => AuthController.onboardSellerStep1(req, res));
app.post('/api/v1/auth/seller-step2', verifyToken, (req, res) => AuthController.onboardSellerStep2(req, res));
app.get('/api/v1/auth/seller-pending', verifyToken, requireRole('admin'), (req, res) => AuthController.getPendingSellers(req, res));
app.post('/api/v1/auth/seller-approve', verifyToken, requireRole('admin'), (req, res) => AuthController.approveSeller(req, res));

// Supplier Routes
app.post('/api/v1/suppliers', (req, res) => SupplierController.onboard(req, res));
app.get('/api/v1/suppliers', (req, res) => SupplierController.list(req, res));

// Product Routes
app.post('/api/v1/products', verifyToken, requireRole('supplier'), (req, res) => ProductController.create(req, res));
app.get('/api/v1/products', (req, res) => ProductController.query(req, res));
app.get('/api/v1/products/:id', (req, res) => ProductController.getOne(req, res));

// RFQ & Bids Routes
app.post('/api/v1/rfqs', verifyToken, requireRole('buyer'), (req, res) => RfqController.create(req, res));
app.get('/api/v1/rfqs', (req, res) => RfqController.list(req, res));
app.post('/api/v1/rfqs/:id/bids', verifyToken, requireRole('supplier'), (req, res) => RfqController.bid(req, res));

// Escrow Transaction Routes
app.post('/api/v1/orders', verifyToken, (req, res) => OrderController.create(req, res));
app.get('/api/v1/orders', verifyToken, (req, res) => OrderController.list(req, res));

// Core ONDC/Beckn Protocol Routes
app.post('/api/v1/beckn/search', verifyToken, (req, res) => BecknController.search(req, res));
app.post('/api/v1/beckn/select', verifyToken, (req, res) => BecknController.select(req, res));
app.post('/api/v1/beckn/init', verifyToken, (req, res) => BecknController.init(req, res));
app.post('/api/v1/beckn/confirm', verifyToken, (req, res) => BecknController.confirm(req, res));
app.get('/api/v1/beckn/results', verifyToken, (req, res) => BecknController.getResults(req, res));

// Inbound Async Webhooks (Stand-alone verifiers)
app.post('/api/v1/beckn/on_search', verifyBecknSignature, (req, res) => BecknController.onSearch(req, res));
app.post('/api/v1/beckn/on_select', verifyBecknSignature, (req, res) => BecknController.onSelect(req, res));
app.post('/api/v1/beckn/on_init', verifyBecknSignature, (req, res) => BecknController.onInit(req, res));
app.post('/api/v1/beckn/on_confirm', verifyBecknSignature, (req, res) => BecknController.onConfirm(req, res));

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  captureException(err, {
    tags: { url: req.url, method: req.method },
    extra: {
      headers: req.headers,
      query: req.query,
      body: req.body
    }
  });
  
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred on the server' 
      : err.message
  });
});

// 5. Sync Database Models & Run Seeder
async function startServer() {
  const maxRetries = 5;
  const delay = 3000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sequelize.authenticate();
      logger.info('Database connection authenticated successfully.');
      break;
    } catch (err) {
      if (attempt === maxRetries) {
        logger.error({ msg: 'Fatal: Sequelize failed to authenticate database connection after max retries', err: err.message });
        process.exit(1);
      }
      logger.warn({ msg: `Database connection attempt ${attempt} failed, retrying in ${delay}ms...`, err: err.message });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  try {
    await sequelize.sync({ force: false });
    
    if (sequelize.options.dialect === 'postgres') {
      try {
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
        logger.info('PostgreSQL pg_trgm extension successfully verified and loaded.');
      } catch (e) {
        logger.warn({ msg: 'Failed to configure pg_trgm extension', err: e.message });
      }
    }
    logger.info('Database tables successfully verified and synchronized by Sequelize ORM.');

    // Run idempotent index migrations
    try {
      await runIndexMigration(sequelize.getQueryInterface(), sequelize.constructor);
      logger.info('Database index migrations applied successfully.');
    } catch (e) {
      logger.warn({ msg: 'Index migration warning', err: e.message });
    }

    await runSeeder();
    
    app.listen(PORT, () => {
      logger.info({
        msg: 'BuyEway B2B Gateway running',
        port: PORT,
        env: process.env.NODE_ENV || 'development'
      });
    });
  } catch (err) {
    logger.error({ msg: 'Fatal: Sequelize failed to sync database models', err: err.message });
    process.exit(1);
  }
}

startServer();

async function runSeeder() {
  try {
    try {
      await sequelize.query('ALTER TABLE users ADD COLUMN "sellerStatus" VARCHAR(255) DEFAULT \'none\';');
      logger.info('DB Migration: Added sellerStatus column to users table.');
    } catch (e) { /* column already exists */ }

    try {
      await sequelize.query('ALTER TABLE users ADD COLUMN "isKycVerified" BOOLEAN DEFAULT FALSE;');
      logger.info('DB Migration: Added isKycVerified column to users table.');
    } catch (e) { /* column already exists */ }

    const adminEmail = 'admin@buyeway.com';
    const adminUser = await User.findOne({ where: { email: adminEmail } });
    if (!adminUser) {
      const bcrypt = require('bcryptjs');
      const hashedAdminPassword = bcrypt.hashSync('admin123', 10);
      await User.create({
        name: '🛡️ Admin Central',
        email: adminEmail,
        password: hashedAdminPassword,
        role: 'admin',
        sellerStatus: 'none',
        location: 'Gandhinagar, Gujarat',
        state: 'Gujarat',
        isKycVerified: true
      });
      logger.info('Seeded default admin user: admin@buyeway.com');
    }

    const buyerEmail = 'buyer@buyeway.com';
    const buyerUser = await User.findOne({ where: { email: buyerEmail } });
    if (!buyerUser) {
      const bcrypt = require('bcryptjs');
      const hashedBuyerPassword = bcrypt.hashSync('password123', 10);
      await User.create({
        name: 'Kunal Buyer (Procurement)',
        email: buyerEmail,
        password: hashedBuyerPassword,
        role: 'buyer',
        sellerStatus: 'none',
        location: 'Mumbai, Maharashtra',
        state: 'Maharashtra',
        isKycVerified: false
      });
      logger.info('Seeded default buyer user: buyer@buyeway.com');
    }

    const sellerEmail = 'seller@buyeway.com';
    const sellerUser = await User.findOne({ where: { email: sellerEmail } });
    if (!sellerUser) {
      const bcrypt = require('bcryptjs');
      const hashedSellerPassword = bcrypt.hashSync('password123', 10);
      const user = await User.create({
        name: 'Surat Handloom Mills Ltd',
        email: sellerEmail,
        password: hashedSellerPassword,
        role: 'supplier',
        sellerStatus: 'approved',
        location: 'Surat, Gujarat',
        state: 'Gujarat',
        gstin: '24AAAFF1234F1Z9',
        iso: 'ISO 9001:2015',
        isKycVerified: true
      });
      await Supplier.create({
        name: user.name,
        location: user.location,
        state: user.state,
        joined: 'Joined Today',
        trustScore: '98%',
        responseTime: '< 2 Hours',
        gstin: user.gstin,
        iso: user.iso,
        userId: user.id
      });
      logger.info('Seeded default supplier user: seller@buyeway.com');
    }

    const pendingEmail = 'pending_seller@buyeway.com';
    const pendingUser = await User.findOne({ where: { email: pendingEmail } });
    if (!pendingUser) {
      const bcrypt = require('bcryptjs');
      const hashedPendingPassword = bcrypt.hashSync('password123', 10);
      await User.create({
        name: 'Apex Industrial Castings',
        email: pendingEmail,
        password: hashedPendingPassword,
        role: 'buyer',
        sellerStatus: 'pending_approval',
        location: 'Morbi, Gujarat',
        state: 'Gujarat',
        gstin: '24XYZ9876A1Z3BB',
        iso: 'ISO 14001 Compliant',
        isKycVerified: true
      });
      logger.info('Seeded pending seller: pending_seller@buyeway.com');
    }

    const suppliersCount = await Supplier.count();
    if (suppliersCount > 0) {
      logger.info('Database already populated — seeder bypassed.');
      return;
    }

    logger.info('Database empty — initiating enterprise bulk seed...');

    const suppliers = await Supplier.bulkCreate([
      { name: 'Gujarat Handloom & Silk Weaves', location: 'Surat, Gujarat', state: 'Gujarat', joined: '6 Years on Platform', trustScore: '98%', responseTime: '< 2 Hours', gstin: '24AAAFF1234F1Z5', iso: 'ISO 9001:2015 Certified' },
      { name: 'Morbi Ceramic export-import Corp', location: 'Morbi, Gujarat', state: 'Gujarat', joined: '4 Years on Platform', trustScore: '96%', responseTime: '< 3 Hours', gstin: '24BBBDD4321A2Z3', iso: 'ISO 14001 Compliant' },
      { name: 'Tirupur Apparel Craft Mills', location: 'Tirupur, Tamil Nadu', state: 'Tamil Nadu', joined: '8 Years on Platform', trustScore: '99%', responseTime: '< 1 Hour', gstin: '33AAACT7890C1Z4', iso: 'WRAP & Oeko-Tex Standard 100' },
      { name: 'Aligarh Industrial Security Locks Ltd', location: 'Aligarh, Uttar Pradesh', state: 'Uttar Pradesh', joined: '12 Years on Platform', trustScore: '97%', responseTime: '< 4 Hours', gstin: '09AAACA1299C2Z8', iso: 'ISO 9001:2015 Approved' },
      { name: 'Assam Valley Tea Growers Cooperative', location: 'Dibrugarh, Assam', state: 'Assam', joined: '5 Years on Platform', trustScore: '95%', responseTime: '< 2 Hours', gstin: '18AAACA5555L1Z1', iso: 'FSSAI & Spice Board India Registered' }
    ]);

    logger.info('Suppliers seeded.');

    const p1 = await Product.create({
      name: 'Pure Banarasi Silk Designer Saree Collection',
      category: 'Textiles & Garments',
      hub: 'surat',
      weightPerUnit: 0.8,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      images: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80,https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
      hsn: '50072010',
      unit: 'Pieces',
      moq: 100,
      leadTime: '15 days (Under 500 pcs)',
      description: 'Exquisite Banarasi sarees made with rich golden zari borders and premium synthetic-silk blend. Perfect for boutiques and large retailers.',
      supplierId: suppliers[0].id
    });
    await PriceTier.bulkCreate([
      { productId: p1.id, min: 100, max: 299, price: 850 },
      { productId: p1.id, min: 300, max: 999, price: 720 },
      { productId: p1.id, min: 1000, max: null, price: 600 }
    ]);

    const p2 = await Product.create({
      name: 'Premium Double Charge Polished Vitrified Floor Tiles',
      category: 'Home & Ceramics',
      hub: 'morbi',
      weightPerUnit: 14.5,
      image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80',
      images: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80,https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
      hsn: '69072100',
      unit: 'Sqm',
      moq: 500,
      leadTime: '20 days (Factory dispatch)',
      description: '600x1200mm gloss finished vitrified floor tiles with exceptional scratch and stain resistance.',
      supplierId: suppliers[1].id
    });
    await PriceTier.bulkCreate([
      { productId: p2.id, min: 500, max: 1999, price: 340 },
      { productId: p2.id, min: 2000, max: 4999, price: 290 },
      { productId: p2.id, min: 5000, max: null, price: 250 }
    ]);

    const p3 = await Product.create({
      name: '100% Combed Cotton Bio-Washed Wholesale Plain Tees',
      category: 'Textiles & Garments',
      hub: 'tirupur',
      weightPerUnit: 0.2,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      images: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80,https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80',
      hsn: '61091000',
      unit: 'Pieces',
      moq: 200,
      leadTime: '12 days (Stock colors)',
      description: '180 GSM, super-soft combed cotton wholesale shirts perfect for custom printing, embroidery, corporate giveaways, or private labels.',
      supplierId: suppliers[2].id
    });
    await PriceTier.bulkCreate([
      { productId: p3.id, min: 200, max: 999, price: 110 },
      { productId: p3.id, min: 1000, max: 4999, price: 95 },
      { productId: p3.id, min: 5000, max: null, price: 80 }
    ]);

    logger.info('Products and price tiers seeded.');

    const rfqs = await Rfq.bulkCreate([
      {
        title: 'Sourcing 5,000 Pcs Bio-Washed Hoodies for Winter Sourcing',
        category: 'Textiles & Garments',
        quantity: 5000,
        unit: 'Pieces',
        targetPrice: 320,
        buyerName: 'Aman G. (TrendSet Apparel)',
        buyerLocation: 'Bengaluru, Karnataka',
        datePosted: '2 hours ago',
        description: 'Looking for 300 GSM fleece bio-washed hoodies in 5 mix corporate colors.',
        status: 'Active (1 Bids)'
      },
      {
        title: 'Morbi Style Vitrified Wall Tiles for Commercial Plaza',
        category: 'Home & Ceramics',
        quantity: 8000,
        unit: 'Sqm',
        targetPrice: 240,
        buyerName: 'Vikram R. (Vikas Construction)',
        buyerLocation: 'Noida, Uttar Pradesh',
        datePosted: '1 day ago',
        description: 'Need glossy digital tiles of size 300x600mm.',
        status: 'Active (0 Bids)'
      }
    ]);

    await Bid.create({
      rfqId: rfqs[0].id,
      supplierName: 'South Textile Mills',
      bidPrice: 310,
      logisticsTerms: 'Ready stock, 10 days dispatch via V-Trans road carrier'
    });

    await Order.create({
      orderCode: 'ORD-9872',
      productName: 'Premium Double Charge Polished Vitrified Floor Tiles',
      buyerName: 'Kunal Builders (Mumbai)',
      quantity: 1500,
      subtotal: 510000,
      tax: 91800,
      freight: 130500,
      total: 732300,
      status: 'Escrow Funded',
      dateCreated: 'Yesterday'
    });

    logger.info('Enterprise bulk seed completed successfully.');
  } catch (err) {
    logger.error({ msg: 'Seeder error', err: err.message });
  }
}
