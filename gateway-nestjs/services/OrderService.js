// services/OrderService.js
// Handles B2B escrow order creation with:
// - Go microservice call (8s timeout + 1 retry)
// - Atomic DB writes via Sequelize transaction
// - Redis cache invalidation after order creation
'use strict';

const http = require('http');
const { Sequelize } = require('sequelize');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const PriceTier = require('../models/PriceTier');
const Order = require('../models/Order');
const sequelize = require('../config/database');
const logger = require('../config/logger');
const { cacheInvalidate } = require('../config/cache');

const GO_TIMEOUT_MS = parseInt(process.env.GO_TIMEOUT_MS || '8000');
const GO_RETRY_DELAY_MS = 500;

/**
 * Call the Go calculation microservice with a single retry on connection failure.
 * Enforces a configurable timeout (default 8 s).
 */
function postToCalculationEngine(payload, attempt = 1) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const computeUrl = process.env.COMPUTE_SERVICE_URL || 'http://localhost:8080';
    let hostname = 'localhost';
    let port = 8080;

    try {
      const parsedUrl = new URL(computeUrl);
      hostname = parsedUrl.hostname;
      port = parseInt(parsedUrl.port) || (parsedUrl.protocol === 'https:' ? 443 : 80);
    } catch (e) {
      logger.warn({ msg: 'Failed to parse COMPUTE_SERVICE_URL, using fallback', url: computeUrl });
    }

    const options = {
      hostname,
      port,
      path: '/calculate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: GO_TIMEOUT_MS
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse Go service response: ${e.message}`));
          }
        } else {
          reject(new Error(`Go service returned status ${res.statusCode}: ${data}`));
        }
      });
    });

    // Timeout handler — abort and optionally retry once
    req.on('timeout', () => {
      req.destroy();
      logger.warn({ msg: 'Go service request timed out', attempt, timeoutMs: GO_TIMEOUT_MS });
      if (attempt === 1) {
        setTimeout(() => {
          postToCalculationEngine(payload, 2).then(resolve).catch(reject);
        }, GO_RETRY_DELAY_MS);
      } else {
        reject(new Error(`Go calculation service timed out after ${GO_TIMEOUT_MS}ms (2 attempts)`));
      }
    });

    // Connection-level error — retry once
    req.on('error', (e) => {
      logger.warn({ msg: 'Go service connection error', attempt, err: e.message });
      if (attempt === 1) {
        setTimeout(() => {
          postToCalculationEngine(payload, 2).then(resolve).catch(reject);
        }, GO_RETRY_DELAY_MS);
      } else {
        reject(new Error(`Failed to connect to Go calculation service: ${e.message}`));
      }
    });

    req.write(postData);
    req.end();
  });
}

class OrderService {
  async createB2bOrder({ items, buyerState, carrier, paymentMethod, buyerName }) {
    if (!items || !buyerState) {
      throw new Error('Incomplete wholesale contract parameters');
    }

    const itemsArray = Array.isArray(items) ? items : [items];
    if (itemsArray.length === 0) {
      throw new Error('No items specified in the sourcing contract');
    }

    // 1. Gather all product specifications, pricing tiers, and supplier states
    const goItems = [];
    for (const item of itemsArray) {
      const pId = item.productId.replace('p', '');
      const product = await Product.findByPk(pId, {
        include: [
          { model: Supplier, as: 'supplier' },
          { model: PriceTier, as: 'tiers' }
        ]
      });

      if (!product || !product.supplier || !product.tiers) {
        throw new Error(`Associated manufacturer catalog record missing for item: ${item.productId}`);
      }

      goItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: parseInt(item.quantity),
        weightPerUnit: parseFloat(product.weightPerUnit) || 1.0,
        tiers: (product.tiers || []).map(t => ({
          min: t.min,
          max: t.max,
          price: parseFloat(t.price)
        })),
        supplierState: product.supplier.state || 'Gujarat',
        supplierId: product.supplierId
      });
    }

    // 2. Build calculations request payload
    const goPayload = {
      items: goItems,
      buyerState,
      carrier: carrier || 'vtrans',
      paymentMethod: paymentMethod || 'NEFT'
    };

    // 3. Delegate to Go microservice (with timeout + retry)
    const calcResult = await postToCalculationEngine(goPayload);

    // 4. Atomically commit all sub-orders — if any insert fails, roll everything back
    const createdSuborders = await sequelize.transaction(async (t) => {
      const suborders = [];
      for (const sub of calcResult.suborders) {
        const dbSuborder = await Order.create({
          orderCode: sub.orderCode,
          parentCode: calcResult.parentCode,
          productName: sub.productName,
          buyerName: buyerName || `Verified Sourcing Member (${buyerState})`,
          quantity: sub.quantity,
          subtotal: sub.subtotal,
          tax: sub.tax,
          freight: sub.freight,
          total: sub.total,
          status: 'Escrow Funded',
          dateCreated: 'Today',
          supplierId: sub.supplierId
        }, { transaction: t });
        suborders.push(dbSuborder);
      }
      return suborders;
    });

    // 5. Invalidate cached order lists so dashboards refresh
    await cacheInvalidate('orders:*');

    logger.info({
      msg: 'B2B escrow order created',
      parentCode: calcResult.parentCode,
      suborderCount: createdSuborders.length
    });

    return {
      parentCode: calcResult.parentCode,
      suborders: createdSuborders,
      message: calcResult.message
    };
  }

  async getAllOrders(supplierId) {
    const where = {};
    if (supplierId) {
      where.supplierId = parseInt(supplierId);
    }
    return await Order.findAll({
      where,
      order: [['id', 'DESC']]
    });
  }
}

module.exports = new OrderService();
