const ProductService = require('../services/ProductService');
const { productSchema } = require('../validators/schemas');

class ProductController {
  async create(req, res) {
    try {
      // 1. Inject supplierId securely from JWT session into payload for validation
      const payload = {
        ...req.body,
        supplierId: req.user.supplierId
      };

      // 2. Validate using Zod
      const parsed = productSchema.safeParse(payload);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }

      const { name, category, hub, weightPerUnit, moq, unit, priceMax, priceMin, hsn, description, supplierId } = parsed.data;

      const product = await ProductService.listProduct({
        name,
        category,
        hub,
        weightPerUnit,
        moq,
        unit,
        priceMax,
        priceMin,
        hsn,
        description,
        supplierId
      });

      res.status(201).json({
        id: 'p' + product.id,
        message: 'Product wholesale listing successfully created!'
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async query(req, res) {
    try {
      const { 
        hub, 
        category, 
        search, 
        limit, 
        offset, 
        cursor, 
        sortBy, 
        sortOrder,
        moqMin,
        moqMax,
        priceMin,
        priceMax,
        weightMin,
        weightMax
      } = req.query;

      const products = await ProductService.queryProducts({ 
        hub, 
        category, 
        search, 
        limit, 
        offset, 
        cursor, 
        sortBy, 
        sortOrder,
        moqMin,
        moqMax,
        priceMin,
        priceMax,
        weightMin,
        weightMax
      });
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getOne(req, res) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      res.json(product);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
}

module.exports = new ProductController();
