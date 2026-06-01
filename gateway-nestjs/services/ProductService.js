const { Op, literal } = require('sequelize');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const PriceTier = require('../models/PriceTier');
const sequelize = require('../config/database');
const { cacheGet, cacheSet, cacheInvalidate } = require('../config/cache');

const PRODUCT_CACHE_TTL = parseInt(process.env.PRODUCT_CACHE_TTL || '60');

class ProductService {
  async listProduct({ name, category, hub, weightPerUnit, moq, unit, priceMax, priceMin, hsn, description, supplierId }) {
    if (!name || !moq || !priceMin || !priceMax || !supplierId) {
      throw new Error('Wholesale listing title, MOQ, pricing scales, and supplier ID are mandatory');
    }

    let defaultImage = 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80';
    let extraImages = defaultImage;
    
    const catLower = (category || '').toLowerCase();
    if (catLower.includes('textile') || catLower.includes('garment') || catLower.includes('apparel')) {
      defaultImage = 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=600&q=80';
      extraImages = 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=600&q=80,https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80';
    } else if (catLower.includes('ceramic') || catLower.includes('home') || catLower.includes('building')) {
      defaultImage = 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80';
      extraImages = 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80,https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80';
    } else if (catLower.includes('food') || catLower.includes('agri') || catLower.includes('tea')) {
      defaultImage = 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80';
      extraImages = 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80,https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=600&q=80';
    } else if (catLower.includes('hardware') || catLower.includes('industrial') || catLower.includes('tool')) {
      defaultImage = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
      extraImages = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80,https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?auto=format&fit=crop&w=600&q=80';
    }

    // Create product and price tiers atomically — if tier creation fails, the
    // product row is rolled back automatically.
    const product = await sequelize.transaction(async (t) => {
      const prod = await Product.create({
        name,
        category,
        hub,
        weightPerUnit: parseFloat(weightPerUnit) || 1.0,
        image: defaultImage,
        images: extraImages,
        hsn: hsn || '84818030',
        unit,
        moq: parseInt(moq),
        leadTime: '15 days ex-factory',
        description,
        supplierId: parseInt(supplierId)
      }, { transaction: t });

      await PriceTier.bulkCreate([
        { productId: prod.id, min: parseInt(moq), max: Math.ceil(parseInt(moq) * 2.5), price: parseFloat(priceMax) },
        { productId: prod.id, min: Math.ceil(parseInt(moq) * 2.5) + 1, max: null, price: parseFloat(priceMin) }
      ], { transaction: t });

      return prod;
    });

    // Invalidate product list cache so the new listing is immediately visible
    await cacheInvalidate('products:*');
    return product;
  }

  async queryProducts({ 
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
  }) {
    // Build a deterministic cache key from query parameters
    const cacheKey = `products:${JSON.stringify({ hub, category, search, limit, offset, cursor, sortBy, sortOrder, moqMin, moqMax, priceMin, priceMax, weightMin, weightMax })}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const where = {};
    if (hub) where.hub = hub;
    if (category) where.category = category;
    
    // Standardized Filtering Bounds
    if (moqMin || moqMax) {
      where.moq = {};
      if (moqMin) where.moq[Op.gte] = parseInt(moqMin);
      if (moqMax) where.moq[Op.lte] = parseInt(moqMax);
    }

    if (weightMin || weightMax) {
      where.weightPerUnit = {};
      if (weightMin) where.weightPerUnit[Op.gte] = parseFloat(weightMin);
      if (weightMax) where.weightPerUnit[Op.lte] = parseFloat(weightMax);
    }

    const tierWhere = {};
    let requiredTier = false;
    if (priceMin || priceMax) {
      requiredTier = true;
      if (priceMin) tierWhere.price = { [Op.gte]: parseFloat(priceMin) };
      if (priceMax) tierWhere.price = { ...tierWhere.price, [Op.lte]: parseFloat(priceMax) };
    }

    // Cursor-based Pagination logic (Default is ID descending)
    if (cursor) {
      const cursorId = parseInt(String(cursor).replace('p', ''));
      if (!isNaN(cursorId)) {
        where.id = { [Op.lt]: cursorId };
      }
    }

    // Standardized Sorting Options
    let order = [['id', 'DESC']];
    if (sortBy) {
      const orderDirection = (sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      if (sortBy === 'name') order = [['name', orderDirection]];
      else if (sortBy === 'moq') order = [['moq', orderDirection]];
      else if (sortBy === 'weight') order = [['weightPerUnit', orderDirection]];
      else if (sortBy === 'createdAt') order = [['createdAt', orderDirection]];
      else if (sortBy === 'id') order = [['id', orderDirection]];
    } else if (search) {
      if (sequelize.options.dialect === 'postgres') {
        const escapedSearch = sequelize.escape(search);
        where[Op.or] = [
          literal(`"Product"."name" % ${escapedSearch}`),
          literal(`"Product"."description" % ${escapedSearch}`),
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
        order = [
          [literal(`similarity("Product"."name", ${escapedSearch})`), 'DESC']
        ];
      } else {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }
    }

    // Limit/Offset Pagination
    const parsedLimit = limit !== undefined ? (parseInt(limit) || 10) : null;
    const parsedOffset = offset !== undefined ? (parseInt(offset) || 0) : null;

    const findOptions = {
      where,
      include: [
        { model: Supplier, as: 'supplier' },
        { 
          model: PriceTier, 
          as: 'tiers', 
          where: requiredTier ? tierWhere : undefined, 
          required: requiredTier 
        }
      ],
      order,
      distinct: true
    };

    if (parsedLimit !== null) findOptions.limit = parsedLimit;
    if (parsedOffset !== null) findOptions.offset = parsedOffset;

    // Run find and count query if pagination is requested, else simple find query
    const isPaginated = limit !== undefined || offset !== undefined || cursor !== undefined;
    
    let products = [];
    let totalCount = 0;

    if (isPaginated) {
      const result = await Product.findAndCountAll(findOptions);
      products = result.rows;
      totalCount = result.count;
    } else {
      products = await Product.findAll(findOptions);
    }

    // Format output to match client requirements
    const formattedData = products.map(p => {
      const tiers = p.tiers || [];
      return {
        id: 'p' + p.id,
        dbId: p.id,
        name: p.name,
        category: p.category,
        hub: p.hub,
        weightPerUnit: p.weightPerUnit,
        image: p.image,
        images: p.images.split(','),
        hsn: p.hsn,
        unit: p.unit,
        moq: p.moq,
        leadTime: p.leadTime,
        description: p.description,
        supplier: {
          id: p.supplier.id,
          name: p.supplier.name,
          location: p.supplier.location,
          state: p.supplier.state,
          trustScore: p.supplier.trustScore,
          gstin: p.supplier.gstin,
          verified: true
        },
        tiers: tiers
          .sort((a, b) => a.min - b.min)
          .map(t => ({ min: t.min, max: t.max, price: t.price }))
      };
    });

    if (isPaginated) {
      const currentLimit = parsedLimit || 10;
      const currentOffset = parsedOffset || 0;
      const lastItem = formattedData[formattedData.length - 1];
      const nextCursor = lastItem ? lastItem.id : null;
      const hasMore = totalCount > (currentOffset + formattedData.length);

      const result = {
        data: formattedData,
        pagination: {
          total: totalCount,
          limit: currentLimit,
          offset: currentOffset,
          nextCursor: hasMore ? nextCursor : null,
          hasMore
        }
      };
      await cacheSet(cacheKey, result, PRODUCT_CACHE_TTL);
      return result;
    }

    await cacheSet(cacheKey, formattedData, PRODUCT_CACHE_TTL);
    return formattedData;
  }

  async getProductById(id) {
    const pId = id.replace('p', '');
    const p = await Product.findByPk(pId, {
      include: [
        { model: Supplier, as: 'supplier' },
        { model: PriceTier, as: 'tiers' }
      ]
    });

    if (!p) {
      throw new Error('Product not found in database records');
    }

    const tiers = p.tiers || [];
    return {
      id: 'p' + p.id,
      dbId: p.id,
      name: p.name,
      category: p.category,
      hub: p.hub,
      weightPerUnit: p.weightPerUnit,
      image: p.image,
      images: p.images.split(','),
      hsn: p.hsn,
      unit: p.unit,
      moq: p.moq,
      leadTime: p.leadTime,
      description: p.description,
      supplier: {
        id: p.supplier.id,
        name: p.supplier.name,
        location: p.supplier.location,
        state: p.supplier.state,
        joined: p.supplier.joined,
        iso: p.supplier.iso,
        responseTime: p.supplier.responseTime,
        trustScore: p.supplier.trustScore,
        gstin: p.supplier.gstin,
        verified: true
      },
      tiers: tiers
        .sort((a, b) => a.min - b.min)
        .map(t => ({ min: t.min, max: t.max, price: t.price }))
    };
  }
}

module.exports = new ProductService();
