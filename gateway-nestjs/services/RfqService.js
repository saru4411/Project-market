const { Op } = require('sequelize');
const Rfq = require('../models/Rfq');
const Bid = require('../models/Bid');

class RfqService {
  async broadcastRfq({ title, category, quantity, unit, targetPrice, buyerName, buyerLocation, description }) {
    if (!title || !quantity || !targetPrice) {
      throw new Error('Sourcing requirement title, quantity, and budget price are mandatory RFQ inputs');
    }

    return await Rfq.create({
      title,
      category: category || 'Textiles & Garments',
      quantity: parseInt(quantity),
      unit: unit || 'Units',
      targetPrice: parseFloat(targetPrice),
      buyerName: buyerName || 'Premium Sourcing Member',
      buyerLocation: buyerLocation || 'New Delhi, Delhi',
      description,
      status: 'Active (0 Bids)'
    });
  }

  async submitBid(rfqId, { supplierName, bidPrice, logisticsTerms }) {
    if (!bidPrice || !supplierName) {
      throw new Error('Supplier company identifier and custom bid price are mandatory to submit a quote');
    }

    const bid = await Bid.create({
      rfqId: parseInt(rfqId),
      supplierName,
      bidPrice: parseFloat(bidPrice),
      logisticsTerms: logisticsTerms || 'Standard ex-factory carrier terms'
    });

    // Update RFQ status count
    const bidsCount = await Bid.count({ where: { rfqId } });
    await Rfq.update(
      { status: `Active (${bidsCount} Bids)` },
      { where: { id: rfqId } }
    );

    return bid;
  }

  async getActiveRfqs({ limit, offset, cursor, sortBy, sortOrder, category, search, qtyMin, qtyMax, targetPriceMin, targetPriceMax } = {}) {
    const where = {};
    if (category) where.category = category;

    if (cursor) {
      const cursorId = parseInt(cursor);
      if (!isNaN(cursorId)) {
        where.id = { [Op.lt]: cursorId };
      }
    }

    if (qtyMin || qtyMax) {
      where.quantity = {};
      if (qtyMin) where.quantity[Op.gte] = parseInt(qtyMin);
      if (qtyMax) where.quantity[Op.lte] = parseInt(qtyMax);
    }

    if (targetPriceMin || targetPriceMax) {
      where.targetPrice = {};
      if (targetPriceMin) where.targetPrice[Op.gte] = parseFloat(targetPriceMin);
      if (targetPriceMax) where.targetPrice[Op.lte] = parseFloat(targetPriceMax);
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    let order = [['id', 'DESC']];
    if (sortBy) {
      const orderDirection = (sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      if (sortBy === 'title') order = [['title', orderDirection]];
      else if (sortBy === 'quantity') order = [['quantity', orderDirection]];
      else if (sortBy === 'targetPrice') order = [['targetPrice', orderDirection]];
      else if (sortBy === 'id') order = [['id', orderDirection]];
    }

    const parsedLimit = limit !== undefined ? (parseInt(limit) || 10) : null;
    const parsedOffset = offset !== undefined ? (parseInt(offset) || 0) : null;

    const findOptions = {
      where,
      include: [{ model: Bid, as: 'bids' }],
      order,
      distinct: true
    };

    if (parsedLimit !== null) findOptions.limit = parsedLimit;
    if (parsedOffset !== null) findOptions.offset = parsedOffset;

    const isPaginated = limit !== undefined || offset !== undefined || cursor !== undefined;

    let rfqs = [];
    let totalCount = 0;

    if (isPaginated) {
      const result = await Rfq.findAndCountAll(findOptions);
      rfqs = result.rows;
      totalCount = result.count;
    } else {
      rfqs = await Rfq.findAll(findOptions);
    }

    const formattedData = rfqs.map(r => {
      const bids = r.bids || [];
      return {
        id: r.id,
        title: r.title,
        category: r.category,
        quantity: r.quantity,
        unit: r.unit,
        targetPrice: r.targetPrice,
        buyerName: r.buyerName,
        buyerLocation: r.buyerLocation,
        datePosted: r.datePosted,
        description: r.description,
        status: `Active (${bids.length} Bids)`,
        bids: bids.map(b => ({
          supplier: b.supplierName,
          bidPrice: b.bidPrice,
          date: b.datePosted
        }))
      };
    });

    if (isPaginated) {
      const currentLimit = parsedLimit || 10;
      const currentOffset = parsedOffset || 0;
      const lastItem = formattedData[formattedData.length - 1];
      const nextCursor = lastItem ? lastItem.id : null;
      const hasMore = totalCount > (currentOffset + formattedData.length);

      return {
        data: formattedData,
        pagination: {
          total: totalCount,
          limit: currentLimit,
          offset: currentOffset,
          nextCursor: hasMore ? nextCursor : null,
          hasMore
        }
      };
    }

    return formattedData;
  }
}

module.exports = new RfqService();
