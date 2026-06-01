const OrderService = require('../services/OrderService');
const { orderSchema } = require('../validators/schemas');

class OrderController {
  async create(req, res) {
    try {
      const { items, productId, quantity, buyerState, carrier, paymentMethod } = req.body;
      
      // Standardize input to support both legacy single product post and new split B2B items array
      let orderItems = items;
      if (!orderItems) {
        if (productId && quantity) {
          orderItems = [{ productId, quantity: parseInt(quantity) }];
        } else {
          return res.status(400).json({ error: 'No items specified in the wholesale contract proposal' });
        }
      }

      // 1. Zod Validation
      const parsed = orderSchema.safeParse({
        items: orderItems,
        buyerState,
        carrier,
        paymentMethod
      });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }

      // 2. secure inject buyerName
      const buyerName = req.user.name + ` (${req.user.role.toUpperCase()})`;

      const result = await OrderService.createB2bOrder({
        items: parsed.data.items,
        buyerState: parsed.data.buyerState,
        carrier: parsed.data.carrier,
        paymentMethod: parsed.data.paymentMethod,
        buyerName
      });

      res.status(201).json({
        id: result.parentCode,
        suborders: result.suborders,
        message: result.message
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async list(req, res) {
    try {
      // 1. Enforce JWT-based supplier query scoping
      let supplierId = req.query.supplierId;
      
      // If logged-in user is a supplier, restrict query to their own supplierId
      if (req.user.role === 'supplier') {
        supplierId = req.user.supplierId;
      }

      const orders = await OrderService.getAllOrders(supplierId);
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new OrderController();
