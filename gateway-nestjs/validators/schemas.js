const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  location: z.string().min(2, { message: 'Location must be at least 2 characters long' }),
  stateName: z.string().default('Gujarat'),
  role: z.enum(['buyer', 'supplier', 'admin']).optional().default('buyer'),
  gstin: z.string().optional(),
  iso: z.string().optional()
});

const sellerStep1Schema = z.object({
  companyName: z.string().min(2, { message: 'Company Name must be at least 2 characters long' }),
  gstin: z.string().length(15, { message: 'GSTIN must be exactly 15 characters long' }),
  iso: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

const rfqSchema = z.object({
  title: z.string().min(5, { message: 'RFQ Title must be at least 5 characters long' }),
  category: z.string().min(2),
  quantity: z.number().int().positive({ message: 'Quantity must be a positive integer' }),
  unit: z.string().default('Pieces'),
  targetPrice: z.number().positive({ message: 'Target Price must be a positive number' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long' })
});

const productSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters long' }),
  category: z.string().min(2),
  hub: z.string().min(2),
  weightPerUnit: z.number().positive(),
  moq: z.number().int().positive(),
  unit: z.string().default('Pieces'),
  priceMax: z.number().positive(),
  priceMin: z.number().positive(),
  hsn: z.string().optional(),
  description: z.string().min(10),
  supplierId: z.number().int().positive()
});

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.union([z.string(), z.number()]),
    quantity: z.number().int().positive()
  })).min(1, { message: 'Order must contain at least one product item' }),
  buyerState: z.string().min(2),
  carrier: z.string().min(2),
  paymentMethod: z.string().min(2)
});

const bidSchema = z.object({
  bidPrice: z.number().positive({ message: 'Bid price must be a positive number' }),
  logisticsTerms: z.string().min(5, { message: 'Logistics terms must be at least 5 characters long' })
});

const supplierSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  location: z.string().min(2, { message: 'Location must be at least 2 characters long' }),
  stateName: z.string().default('Gujarat'),
  gstin: z.string().length(15, { message: 'GSTIN must be exactly 15 characters long' }),
  iso: z.string().optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  sellerStep1Schema,
  rfqSchema,
  productSchema,
  orderSchema,
  bidSchema,
  supplierSchema
};
