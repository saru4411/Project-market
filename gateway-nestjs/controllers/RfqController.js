const RfqService = require('../services/RfqService');
const User = require('../models/User');
const { rfqSchema, bidSchema } = require('../validators/schemas');

class RfqController {
  async create(req, res) {
    try {
      // Enforce buyer KYC check
      const user = await User.findByPk(req.user.id);
      if (!user || !user.isKycVerified) {
        return res.status(403).json({ error: 'Forbidden: Requires completed buyer KYC Aadhaar/PAN verification to broadcast RFQs' });
      }

      // 1. Validate request payload using Zod
      const parsed = rfqSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }

      const { title, category, quantity, unit, targetPrice, description } = parsed.data;
      
      // 2. Inject buyer info securely from JWT
      const buyerName = req.user.name;
      const buyerLocation = `${req.user.location}, ${req.user.state}`;

      const rfq = await RfqService.broadcastRfq({
        title,
        category,
        quantity,
        unit,
        targetPrice,
        buyerName,
        buyerLocation,
        description
      });

      res.status(201).json({
        id: rfq.id,
        title: rfq.title,
        message: 'Buyer Sourcing RFQ Broadcasted successfully!'
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async bid(req, res) {
    try {
      const rfqId = req.params.id;

      // 1. Validate bid quote payload using Zod
      const parsed = bidSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }

      const { bidPrice, logisticsTerms } = parsed.data;

      // 2. Inject supplier details securely from JWT session
      const supplierName = req.user.name;

      const bid = await RfqService.submitBid(rfqId, {
        supplierName,
        bidPrice,
        logisticsTerms
      });

      res.status(201).json({
        id: bid.id,
        message: 'Factory bid quote registered successfully on the sourcing feed!'
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async list(req, res) {
    try {
      const { 
        limit, 
        offset, 
        cursor, 
        sortBy, 
        sortOrder, 
        category, 
        search, 
        qtyMin, 
        qtyMax, 
        targetPriceMin, 
        targetPriceMax 
      } = req.query;

      const rfqs = await RfqService.getActiveRfqs({ 
        limit, 
        offset, 
        cursor, 
        sortBy, 
        sortOrder, 
        category, 
        search, 
        qtyMin, 
        qtyMax, 
        targetPriceMin, 
        targetPriceMax 
      });
      res.json(rfqs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new RfqController();
