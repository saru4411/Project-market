const SupplierService = require('../services/SupplierService');
const { supplierSchema } = require('../validators/schemas');

class SupplierController {
  async onboard(req, res) {
    try {
      const parsed = supplierSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }

      const { name, location, stateName, gstin, iso } = parsed.data;
      const supplier = await SupplierService.onboardSupplier({
        name,
        location,
        state: stateName,
        gstin,
        iso
      });
      res.status(201).json({
        id: supplier.id,
        name: supplier.name,
        message: 'Supplier profile onboarded successfully!'
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
        location, 
        state, 
        search 
      } = req.query;

      const suppliers = await SupplierService.getAllSuppliers({ 
        limit, 
        offset, 
        cursor, 
        sortBy, 
        sortOrder, 
        location, 
        state, 
        search 
      });
      res.json(suppliers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new SupplierController();
