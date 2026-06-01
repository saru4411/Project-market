const { Op } = require('sequelize');
const Supplier = require('../models/Supplier');

class SupplierService {
  async onboardSupplier({ name, location, state, gstin, iso }) {
    if (!name || !location || !gstin) {
      throw new Error('Company Name, Location, and GSTIN are mandatory onboarding inputs');
    }

    if (gstin.length !== 15) {
      throw new Error('Invalid GSTIN format. Must be exactly 15 characters.');
    }

    try {
      const supplier = await Supplier.create({
        name,
        location,
        state: state || 'Gujarat',
        joined: 'Joined Today',
        trustScore: '100%',
        responseTime: '< 1 Hour',
        gstin,
        iso: iso || 'ISO Certified MSME'
      });
      return supplier;
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw new Error('This business GSTIN is already registered on the network');
      }
      throw err;
    }
  }

  async getAllSuppliers({ limit, offset, cursor, sortBy, sortOrder, location, state, search } = {}) {
    const where = {};
    if (location) where.location = location;
    if (state) where.state = state;

    if (cursor) {
      const cursorId = parseInt(cursor);
      if (!isNaN(cursorId)) {
        where.id = { [Op.lt]: cursorId };
      }
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
        { state: { [Op.like]: `%${search}%` } }
      ];
    }

    let order = [['id', 'DESC']];
    if (sortBy) {
      const orderDirection = (sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      if (sortBy === 'name') order = [['name', orderDirection]];
      else if (sortBy === 'joined') order = [['joined', orderDirection]];
      else if (sortBy === 'trustScore') order = [['trustScore', orderDirection]];
      else if (sortBy === 'id') order = [['id', orderDirection]];
    }

    const parsedLimit = limit !== undefined ? (parseInt(limit) || 10) : null;
    const parsedOffset = offset !== undefined ? (parseInt(offset) || 0) : null;

    const findOptions = { where, order };
    if (parsedLimit !== null) findOptions.limit = parsedLimit;
    if (parsedOffset !== null) findOptions.offset = parsedOffset;

    const isPaginated = limit !== undefined || offset !== undefined || cursor !== undefined;

    let suppliers = [];
    let totalCount = 0;

    if (isPaginated) {
      const result = await Supplier.findAndCountAll(findOptions);
      suppliers = result.rows;
      totalCount = result.count;
    } else {
      suppliers = await Supplier.findAll(findOptions);
    }

    if (isPaginated) {
      const currentLimit = parsedLimit || 10;
      const currentOffset = parsedOffset || 0;
      const lastItem = suppliers[suppliers.length - 1];
      const nextCursor = lastItem ? lastItem.id : null;
      const hasMore = totalCount > (currentOffset + suppliers.length);

      return {
        data: suppliers,
        pagination: {
          total: totalCount,
          limit: currentLimit,
          offset: currentOffset,
          nextCursor: hasMore ? nextCursor : null,
          hasMore
        }
      };
    }

    return suppliers;
  }
}

module.exports = new SupplierService();
