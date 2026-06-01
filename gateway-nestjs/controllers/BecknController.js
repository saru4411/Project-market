// controllers/BecknController.js — Core Beckn/ONDC Protocol Handler
'use strict';

const crypto = require('crypto');
const http = require('http');
const logger = require('../config/logger');
const { cacheGet, cacheSet, cacheAppend, cacheInvalidate } = require('../config/cache');
const { generateBecknHeaders, KEYRING } = require('../middlewares/becknSecurity');

// Helper: Native, dependency-free HTTP POST client for simulated supplier loopback
function httpPost(url, body, headers) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const parsed = new URL(url);
    
    const options = {
      hostname: parsed.hostname || 'localhost',
      port: parsed.port || 8000,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseBody);
        } else {
          reject(new Error(`Webhook returned status ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ── In-Memory State Cache Fallback (for offline setups when Redis is not running) ──
const MEMORY_CACHE = new Map();

async function getCachedData(key) {
  try {
    // 1. Try Redis first
    const val = await cacheGet(key);
    if (val) return val;
  } catch (err) {
    // Graceful fallback to memory
  }
  return MEMORY_CACHE.get(key) || null;
}

async function setCachedData(key, value, ttlSeconds = 300) {
  try {
    // 1. Try Redis first
    await cacheSet(key, value, ttlSeconds);
  } catch (err) {
    // Graceful fallback
  }
  MEMORY_CACHE.set(key, value);
  // Auto-expire memory cache after TTL
  setTimeout(() => {
    MEMORY_CACHE.delete(key);
  }, ttlSeconds * 1000);
}

async function appendCachedData(key, value, ttlSeconds = 300) {
  try {
    await cacheAppend(key, value, ttlSeconds);
  } catch (err) {}
  
  if (!MEMORY_CACHE.has(key)) {
    MEMORY_CACHE.set(key, []);
    setTimeout(() => {
      MEMORY_CACHE.delete(key);
    }, ttlSeconds * 1000);
  }
  const arr = MEMORY_CACHE.get(key);
  if (Array.isArray(arr)) {
    arr.push(value);
  }
}

class BecknController {
  
  // ── Outbound Gateways (Called by Storefront Front-End) ─────────────────────
  
  async search(req, res) {
    try {
      const { text, category, location } = req.body;
      const transactionId = req.body.transaction_id || crypto.randomUUID();
      const messageId = crypto.randomUUID();

      const context = {
        domain: "nic2004:52110",
        country: "IND",
        city: "std:080", // Bengaluru std default
        action: "search",
        core_version: "0.9.4",
        bap_id: "buyer-app.buyeway.com",
        bap_uri: "http://node-gateway:8000/api/v1/beckn",
        transaction_id: transactionId,
        message_id: messageId,
        timestamp: new Date().toISOString()
      };

      const payload = {
        context,
        message: {
          intent: {
            item: { descriptor: { name: text || "" } },
            category: category ? { descriptor: { name: category } } : undefined,
            fulfillment: location ? { end: { location: { address: { area: location } } } } : undefined
          }
        }
      };

      logger.info({ msg: 'Outbound Beckn /search initiated', transaction_id: transactionId });

      // Clear any prior search cached items and initialize empty
      const cacheKey = `beckn:search:results:${transactionId}`;
      await cacheInvalidate(cacheKey);
      MEMORY_CACHE.set(cacheKey, []);
      setTimeout(() => MEMORY_CACHE.delete(cacheKey), 300000);

      // Fire asynchronous simulated network callback in background (1.2 seconds latency)
      this._simulateSupplierNetwork('search', payload);

      res.status(202).json({
        context,
        message: { ack: { status: "ACK" } }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async select(req, res) {
    try {
      const { item_id, supplier_id, transaction_id } = req.body;
      if (!item_id || !supplier_id || !transaction_id) {
        return res.status(400).json({ error: 'Missing select criteria (item_id, supplier_id, transaction_id)' });
      }

      const context = {
        domain: "nic2004:52110",
        country: "IND",
        city: "std:080",
        action: "select",
        core_version: "0.9.4",
        bap_id: "buyer-app.buyeway.com",
        bap_uri: "http://node-gateway:8000/api/v1/beckn",
        transaction_id,
        message_id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      };

      const payload = {
        context,
        message: {
          order: {
            items: [{ id: item_id, quantity: { count: 1 } }],
            provider: { id: supplier_id }
          }
        }
      };

      logger.info({ msg: 'Outbound Beckn /select quote request initiated', transaction_id });

      // Clear selection cache
      const cacheKey = `beckn:select:results:${transaction_id}`;
      await setCachedData(cacheKey, null);

      this._simulateSupplierNetwork('select', payload);

      res.status(202).json({
        context,
        message: { ack: { status: "ACK" } }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async init(req, res) {
    try {
      const { transaction_id, billing, shipping, item_id, supplier_id } = req.body;
      if (!transaction_id || !billing || !shipping) {
        return res.status(400).json({ error: 'Missing init criteria (transaction_id, billing, shipping)' });
      }

      const context = {
        domain: "nic2004:52110",
        country: "IND",
        city: "std:080",
        action: "init",
        core_version: "0.9.4",
        bap_id: "buyer-app.buyeway.com",
        bap_uri: "http://node-gateway:8000/api/v1/beckn",
        transaction_id,
        message_id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      };

      const payload = {
        context,
        message: {
          order: {
            items: [{ id: item_id, quantity: { count: 1 } }],
            provider: { id: supplier_id },
            billing,
            fulfillment: { end: { location: { address: shipping } } }
          }
        }
      };

      logger.info({ msg: 'Outbound Beckn /init contract terms initiated', transaction_id });

      const cacheKey = `beckn:init:results:${transaction_id}`;
      await setCachedData(cacheKey, null);

      this._simulateSupplierNetwork('init', payload);

      res.status(202).json({
        context,
        message: { ack: { status: "ACK" } }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async confirm(req, res) {
    try {
      const { transaction_id, item_id, supplier_id, payment } = req.body;
      if (!transaction_id) {
        return res.status(400).json({ error: 'Missing transaction_id' });
      }

      const context = {
        domain: "nic2004:52110",
        country: "IND",
        city: "std:080",
        action: "confirm",
        core_version: "0.9.4",
        bap_id: "buyer-app.buyeway.com",
        bap_uri: "http://node-gateway:8000/api/v1/beckn",
        transaction_id,
        message_id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      };

      const payload = {
        context,
        message: {
          order: {
            items: [{ id: item_id, quantity: { count: 1 } }],
            provider: { id: supplier_id },
            payment: payment || { status: "PAID", method: "SafeTrade UPI Escrow" }
          }
        }
      };

      logger.info({ msg: 'Outbound Beckn /confirm escrow contract purchase', transaction_id });

      const cacheKey = `beckn:confirm:results:${transaction_id}`;
      await setCachedData(cacheKey, null);

      this._simulateSupplierNetwork('confirm', payload);

      res.status(202).json({
        context,
        message: { ack: { status: "ACK" } }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // ── Standalone Inbound Webhooks (Triggered asynchronously by supplier nodes) ─────

  async onSearch(req, res) {
    try {
      const { context, message } = req.body;
      const transactionId = context.transaction_id;
      logger.info({ msg: 'Inbound Webhook /on_search received', transaction_id: transactionId, sender: req.becknParticipant.subscriberId });

      const cacheKey = `beckn:search:results:${transactionId}`;

      // Append catalog items received from supplier
      if (message && message.catalog && message.catalog.providers) {
        for (const p of message.catalog.providers) {
          const providerData = {
            provider: p.descriptor.name,
            provider_id: p.id,
            location: p.locations ? p.locations[0].address.city : "Unknown Hub",
            trustScore: p.tags ? p.tags.trustScore : "95%",
            items: p.items.map(item => ({
              id: item.id,
              name: item.descriptor.name,
              price: parseFloat(item.price.value),
              currency: item.price.currency || "INR",
              unit: item.descriptor.unit || "Units",
              moq: item.descriptor.moq || 10,
              weightPerUnit: item.descriptor.weightPerUnit || 1.0,
              image: item.descriptor.images ? item.descriptor.images[0] : "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
            }))
          };
          await appendCachedData(cacheKey, providerData);
        }
      }

      res.json({ message: { ack: { status: "ACK" } } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async onSelect(req, res) {
    try {
      const { context, message } = req.body;
      const transactionId = context.transaction_id;
      logger.info({ msg: 'Inbound Webhook /on_select received', transaction_id: transactionId });

      const cacheKey = `beckn:select:results:${transactionId}`;
      await setCachedData(cacheKey, message.order);

      res.json({ message: { ack: { status: "ACK" } } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async onInit(req, res) {
    try {
      const { context, message } = req.body;
      const transactionId = context.transaction_id;
      logger.info({ msg: 'Inbound Webhook /on_init received', transaction_id: transactionId });

      const cacheKey = `beckn:init:results:${transactionId}`;
      await setCachedData(cacheKey, message.order);

      res.json({ message: { ack: { status: "ACK" } } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async onConfirm(req, res) {
    try {
      const { context, message } = req.body;
      const transactionId = context.transaction_id;
      logger.info({ msg: 'Inbound Webhook /on_confirm received', transaction_id: transactionId });

      const cacheKey = `beckn:confirm:results:${transactionId}`;
      await setCachedData(cacheKey, message.order);

      res.json({ message: { ack: { status: "ACK" } } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // ── Results Polling Ingress ──────────────────────────────────────────────────

  async getResults(req, res) {
    try {
      const { transaction_id, action } = req.query;
      if (!transaction_id || !action) {
        return res.status(400).json({ error: 'Missing query parameters transaction_id or action' });
      }

      const cacheKey = `beckn:${action}:results:${transaction_id}`;
      const data = await getCachedData(cacheKey);

      res.json({
        transaction_id,
        action,
        data
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // ── Offline Suppliers open Network Simulator (Internal helper) ──────────────────

  _simulateSupplierNetwork(action, payload) {
    setTimeout(async () => {
      try {
        const transId = payload.context.transaction_id;
        const msgId = payload.context.message_id;
        
        let callbackBody = {};
        
        if (action === 'search') {
          // Generate realistic Indian clusters B2B catalogs
          const query = (payload.message.intent.item.descriptor.name || "").toLowerCase();
          const providers = [];

          if (query.includes('fabric') || query.includes('silk') || query.includes('textile') || query === "") {
            providers.push({
              id: "prov-surat-mills-1",
              descriptor: { name: "Surat Premium Textile Mills" },
              locations: [{ address: { city: "Surat, Gujarat" } }],
              tags: { trustScore: "99%", capacity: "10,000 m/day" },
              items: [
                {
                  id: "beckn-item-surat-silk",
                  descriptor: { name: "Pure Banarasi Silk Yarn (Wholesale Roll)", unit: "Rolls", moq: 20, weightPerUnit: 1.5, images: ["https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500"] },
                  price: { currency: "INR", value: "850.00" }
                },
                {
                  id: "beckn-item-surat-cotton",
                  descriptor: { name: "Raw Khadi Cotton Weave Fabric", unit: "Meters", moq: 100, weightPerUnit: 0.25, images: ["https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=500"] },
                  price: { currency: "INR", value: "120.00" }
                }
              ]
            });
          }

          if (query.includes('ceramic') || query.includes('tile') || query.includes('brick') || query === "") {
            providers.push({
              id: "prov-morbi-ceramics-2",
              descriptor: { name: "Morbi Vitrified Tiles Factory" },
              locations: [{ address: { city: "Morbi, Gujarat" } }],
              tags: { trustScore: "98%", capacity: "2500 crates/week" },
              items: [
                {
                  id: "beckn-item-morbi-tile",
                  descriptor: { name: "Vitrified Glazed Porcelain Floor Tiles (600x600mm)", unit: "Crates", moq: 15, weightPerUnit: 24.0, images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500"] },
                  price: { currency: "INR", value: "2450.00" }
                }
              ]
            });
          }

          if (query.includes('lock') || query.includes('hardware') || query.includes('brass') || query === "") {
            providers.push({
              id: "prov-aligarh-hardware-3",
              descriptor: { name: "Aligarh Brassware & Security Works" },
              locations: [{ address: { city: "Aligarh, Uttar Pradesh" } }],
              tags: { trustScore: "97%", capacity: "5000 units/day" },
              items: [
                {
                  id: "beckn-item-aligarh-lock",
                  descriptor: { name: "Heavy-Duty Brass Padlock (Double Locking Mechanism)", unit: "Pieces", moq: 50, weightPerUnit: 0.8, images: ["https://images.unsplash.com/photo-1510519138101-570d1dca3d66?w=500"] },
                  price: { currency: "INR", value: "340.00" }
                }
              ]
            });
          }

          callbackBody = {
            context: {
              ...payload.context,
              action: "on_search",
              timestamp: new Date().toISOString()
            },
            message: {
              catalog: {
                descriptor: { name: "ONDC Open Sourcing Directory" },
                providers
              }
            }
          };

        } else if (action === 'select') {
          const item = payload.message.order.items[0];
          const providerId = payload.message.order.provider.id;
          
          let selectItem = { id: "item-selected", descriptor: { name: "ONDC Sourced Item" }, price: { value: "500.00" } };
          if (item.id === "beckn-item-surat-silk") {
            selectItem = { id: "beckn-item-surat-silk", descriptor: { name: "Pure Banarasi Silk Yarn (Wholesale Roll)" }, price: { value: "850.00" } };
          } else if (item.id === "beckn-item-morbi-tile") {
            selectItem = { id: "beckn-item-morbi-tile", descriptor: { name: "Vitrified Glazed Porcelain Floor Tiles (600x600mm)" }, price: { value: "2450.00" } };
          } else if (item.id === "beckn-item-aligarh-lock") {
            selectItem = { id: "beckn-item-aligarh-lock", descriptor: { name: "Heavy-Duty Brass Padlock (Double Locking Mechanism)" }, price: { value: "340.00" } };
          }

          const baseCost = parseFloat(selectItem.price.value) * 50; // mock Qty 50
          const tax = baseCost * 0.18;
          const freight = baseCost * 0.05;

          callbackBody = {
            context: { ...payload.context, action: "on_select", timestamp: new Date().toISOString() },
            message: {
              order: {
                provider: { id: providerId, descriptor: { name: "ONDC Certified Supplier" } },
                items: [{ ...selectItem, quantity: { count: 50 } }],
                quote: {
                  price: { currency: "INR", value: String(baseCost + tax + freight) },
                  breakup: [
                    { title: "Ex-Factory Base Price", price: { currency: "INR", value: String(baseCost) } },
                    { title: "Sourcing tax (GST 18%)", price: { currency: "INR", value: String(tax) } },
                    { title: "Weight-Based Freight Sizing", price: { currency: "INR", value: String(freight) } }
                  ]
                }
              }
            }
          };

        } else if (action === 'init') {
          const order = payload.message.order;
          const quoteBase = 50000.0;
          
          callbackBody = {
            context: { ...payload.context, action: "on_init", timestamp: new Date().toISOString() },
            message: {
              order: {
                provider: order.provider,
                items: order.items,
                billing: order.billing,
                fulfillment: order.fulfillment,
                payment: {
                  uri: "https://buyeway.com/escrow-gate",
                  type: "SafeTrade NEFT Escrow",
                  status: "NOT-PAID"
                }
              }
            }
          };

        } else if (action === 'confirm') {
          const order = payload.message.order;
          
          callbackBody = {
            context: { ...payload.context, action: "on_confirm", timestamp: new Date().toISOString() },
            message: {
              order: {
                provider: order.provider,
                items: order.items,
                payment: order.payment,
                id: "BKN-ORD-" + crypto.randomBytes(4).toString('hex').toUpperCase(),
                status: "Escrow Funded & Wholesale Dispatched",
                tracking_id: "TRK-BKN-" + crypto.randomBytes(3).toString('hex').toUpperCase()
              }
            }
          };
        }

        // Generate cryptographic headers using the Supplier's base64 private key!
        const supplierKey = KEYRING['supplier-node-1.com|key1'];
        const becknHeaders = generateBecknHeaders(
          callbackBody,
          'supplier-node-1.com|key1',
          supplierKey.privateKey
        );

        // Make HTTP loopback POST call to our own webhook, running it through the verification filters!
        const webhookUrl = `http://localhost:8000/api/v1/beckn/on_${action}`;
        
        logger.info({
          msg: `Simulated Node calling webhook /on_${action}`,
          webhookUrl,
          keyId: 'supplier-node-1.com|key1'
        });

        await httpPost(webhookUrl, callbackBody, becknHeaders);
      } catch (err) {
        logger.error({ msg: 'Suppliers Network Simulator crashed', err: err.message });
      }
    }, 1500); // 1.5 seconds latency simulation
  }
}

module.exports = new BecknController();
