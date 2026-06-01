const test = require('node:test');
const assert = require('node:assert');
const sequelize = require('../config/database');

// Import Models
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const PriceTier = require('../models/PriceTier');
const Rfq = require('../models/Rfq');
const Bid = require('../models/Bid');
const Order = require('../models/Order');

// Import Services
const SupplierService = require('../services/SupplierService');
const ProductService = require('../services/ProductService');
const RfqService = require('../services/RfqService');
const OrderService = require('../services/OrderService');

test('IndiTrade Comprehensive Integration & Service Logic Suite', async (t) => {
  // Sync database tables fresh before running tests
  await sequelize.sync({ force: true });

  let testSupplierId = null;
  let testProductId = null;
  let testRfqId = null;

  await t.test('1. Supplier Onboarding & MSME Verification Integration', async () => {
    const supplier = await SupplierService.onboardSupplier({
      name: 'Morbi Ceramics & Glazes Ltd',
      location: 'Morbi, Gujarat',
      state: 'Gujarat',
      gstin: '24MORBI1234F1Z9',
      iso: 'ISO 9001:2015 MSME'
    });

    assert.ok(supplier);
    assert.ok(supplier.id);
    assert.strictEqual(supplier.name, 'Morbi Ceramics & Glazes Ltd');
    assert.strictEqual(supplier.gstin, '24MORBI1234F1Z9');
    assert.strictEqual(supplier.iso, 'ISO 9001:2015 MSME');

    testSupplierId = supplier.id;

    // Verify it exists in database
    const dbSupplier = await Supplier.findByPk(testSupplierId);
    assert.ok(dbSupplier);
    assert.strictEqual(dbSupplier.name, 'Morbi Ceramics & Glazes Ltd');
  });

  await t.test('2. Product Listing & Volume Pricing Tier Generation Integration', async () => {
    assert.ok(testSupplierId, 'Supplier ID must be populated from Step 1');

    const product = await ProductService.listProduct({
      name: 'Double Charged Gloss Vitrified Floor Tiles',
      category: 'Home & Ceramics',
      hub: 'morbi',
      weightPerUnit: 14.2,
      moq: 500,
      unit: 'Sqm',
      priceMax: '350.00',
      priceMin: '280.00',
      hsn: '69072100',
      description: 'Polished vitrified floor tiles with exceptional scratch and stain resistance. Ideal for large hardware importers.',
      supplierId: testSupplierId
    });

    assert.ok(product);
    assert.ok(product.id);
    assert.strictEqual(product.name, 'Double Charged Gloss Vitrified Floor Tiles');
    assert.strictEqual(product.moq, 500);

    testProductId = 'p' + product.id;

    // Verify product with associated tiers and supplier profile loads correctly
    const productDetail = await ProductService.getProductById(testProductId);
    assert.ok(productDetail);
    assert.strictEqual(productDetail.id, testProductId);
    assert.strictEqual(productDetail.supplier.name, 'Morbi Ceramics & Glazes Ltd');
    assert.ok(productDetail.tiers.length >= 2);
    
    // Check sorted tiers min/max prices
    assert.strictEqual(productDetail.tiers[0].min, 500);
    assert.strictEqual(productDetail.tiers[0].max, 1250);
    assert.strictEqual(productDetail.tiers[0].price, 350.00);
  });

  await t.test('3. RFQ Sourcing Broadcast & Custom Bidding Timeline Integration', async () => {
    const rfq = await RfqService.broadcastRfq({
      title: 'Sourcing 10,000 Sqm Vitrified Floor Tiles',
      category: 'Home & Ceramics',
      quantity: 10000,
      unit: 'Sqm',
      targetPrice: 300,
      buyerName: 'Amit S. (Apex Developers)',
      buyerLocation: 'Mumbai, Maharashtra',
      description: 'Looking to purchase high-quality polished tiles of size 600x1200mm for large commercial plaza project.'
    });

    assert.ok(rfq);
    assert.ok(rfq.id);
    assert.strictEqual(rfq.title, 'Sourcing 10,000 Sqm Vitrified Floor Tiles');
    assert.strictEqual(rfq.quantity, 10000);

    testRfqId = rfq.id;

    // Submit a supplier bid quote on this RFQ
    const bid = await RfqService.submitBid(testRfqId, {
      supplierName: 'Morbi Ceramics & Glazes Ltd',
      bidPrice: 295,
      logisticsTerms: 'Ready stock, 12 days dispatch via TCI road cargo'
    });

    assert.ok(bid);
    assert.ok(bid.id);
    assert.strictEqual(bid.rfqId, testRfqId);
    assert.strictEqual(bid.bidPrice, 295.00);

    // Retrieve active RFQ feed and verify bids aggregate correctly
    const activeFeed = await RfqService.getActiveRfqs();
    assert.ok(activeFeed.length > 0);
    
    const matchedRfq = activeFeed.find(r => r.id === testRfqId);
    assert.ok(matchedRfq);
    assert.strictEqual(matchedRfq.status, 'Active (1 Bids)');
    assert.strictEqual(matchedRfq.bids[0].supplier, 'Morbi Ceramics & Glazes Ltd');
    assert.strictEqual(matchedRfq.bids[0].bidPrice, 295.00);
  });

  await t.test('4. SafeTrade B2B Escrow Contract Generation Mock Sizing Check', async () => {
    assert.ok(testSupplierId, 'Supplier ID must be populated');
    
    // Simulate order placement
    const orderItems = [{ productId: testProductId, quantity: 600 }];
    const buyerName = 'Apex Developers (BUYER)';

    const result = await OrderService.createB2bOrder({
      items: orderItems,
      buyerState: 'Maharashtra',
      carrier: 'vtrans',
      paymentMethod: 'RTGS',
      buyerName
    });

    assert.ok(result);
    assert.ok(result.parentCode);
    assert.ok(result.suborders.length > 0);
    
    // Verify stored order in database
    const dbOrder = await Order.findOne({ where: { parentCode: result.parentCode } });
    assert.ok(dbOrder);
    assert.strictEqual(dbOrder.buyerName, buyerName);
    assert.strictEqual(dbOrder.quantity, 600);
  });

  await t.test('5. Standardized Pagination, Sorting, and Filtering Integration Check', async () => {
    assert.ok(testSupplierId, 'Supplier ID must be populated');

    // Create 3 additional test products for pagination
    await ProductService.listProduct({
      name: 'Ceramic Vitrified Wall Tiles Type B',
      category: 'Home & Ceramics',
      hub: 'morbi',
      weightPerUnit: 10.0,
      moq: 300,
      unit: 'Sqm',
      priceMax: '250.00',
      priceMin: '200.00',
      hsn: '69072100',
      description: 'Polished vitrified wall tiles with light patterns.',
      supplierId: testSupplierId
    });

    await ProductService.listProduct({
      name: 'Premium Banarasi Saree Type C',
      category: 'Textiles & Garments',
      hub: 'surat',
      weightPerUnit: 0.9,
      moq: 150,
      unit: 'Pieces',
      priceMax: '950.00',
      priceMin: '800.00',
      hsn: '50072010',
      description: 'Exclusive designer silk saree with heavy golden embroidery.',
      supplierId: testSupplierId
    });

    await ProductService.listProduct({
      name: 'Combed Cotton Printed Tees Type D',
      category: 'Textiles & Garments',
      hub: 'tirupur',
      weightPerUnit: 0.25,
      moq: 800,
      unit: 'Pieces',
      priceMax: '150.00',
      priceMin: '120.00',
      hsn: '61091000',
      description: 'Printed wholesale shirts.',
      supplierId: testSupplierId
    });

    // 1. Assert Limit/Offset Pagination
    const page1 = await ProductService.queryProducts({
      limit: 2,
      offset: 0
    });

    assert.ok(page1);
    assert.ok(page1.data);
    assert.ok(page1.pagination);
    assert.strictEqual(page1.data.length, 2);
    assert.strictEqual(page1.pagination.limit, 2);
    assert.strictEqual(page1.pagination.offset, 0);
    assert.strictEqual(page1.pagination.total, 4); // 1 from earlier test + 3 new ones
    assert.strictEqual(page1.pagination.hasMore, true);

    const page2 = await ProductService.queryProducts({
      limit: 2,
      offset: 2
    });

    assert.ok(page2);
    assert.strictEqual(page2.data.length, 2);
    assert.strictEqual(page2.pagination.hasMore, false);

    // 2. Assert Standardized Sorting (sortBy MOQ ASC)
    const sorted = await ProductService.queryProducts({
      sortBy: 'moq',
      sortOrder: 'ASC'
    });

    // Verify plain array format when limit/offset/cursor is not present
    assert.ok(Array.isArray(sorted));
    assert.strictEqual(sorted.length, 4);
    assert.ok(sorted[0].moq <= sorted[1].moq);
    assert.ok(sorted[1].moq <= sorted[2].moq);
    assert.ok(sorted[2].moq <= sorted[3].moq);

    // 3. Assert Standardized Filtering Bounds (MOQ between 200 and 600)
    const filtered = await ProductService.queryProducts({
      moqMin: 200,
      moqMax: 600
    });

    assert.ok(Array.isArray(filtered));
    for (const p of filtered) {
      assert.ok(p.moq >= 200);
      assert.ok(p.moq <= 600);
    }
  });

  // Clean shutdown of DB and Cache connections to prevent hanging open handles
  const { closeCache } = require('../config/cache');
  await sequelize.close();
  await closeCache();
});
