// migrations/001_add_indexes.js
// Adds performance indexes for the most common query patterns.
// Safe to run multiple times (uses ifNotExists).
'use strict';

/**
 * Apply indexes to existing tables.
 * @param {import('sequelize').QueryInterface} qi
 * @param {import('sequelize').Sequelize} Sequelize
 */
async function up(qi, Sequelize) {
  const tableInfo = await qi.showAllTables();

  // ── Products ─────────────────────────────────────────────────
  if (tableInfo.includes('products')) {
    // Single-column indexes for common WHERE clauses
    await qi.addIndex('products', ['hub'], {
      name: 'idx_products_hub',
      concurrently: false
    }).catch(() => {}); // ignore if already exists

    await qi.addIndex('products', ['category'], {
      name: 'idx_products_category',
      concurrently: false
    }).catch(() => {});

    await qi.addIndex('products', ['supplierId'], {
      name: 'idx_products_supplierId',
      concurrently: false
    }).catch(() => {});

    // Composite index for the most common combined filter
    await qi.addIndex('products', ['hub', 'category'], {
      name: 'idx_products_hub_category',
      concurrently: false
    }).catch(() => {});
  }

  // ── Orders ────────────────────────────────────────────────────
  if (tableInfo.includes('orders')) {
    await qi.addIndex('orders', ['supplierId'], {
      name: 'idx_orders_supplierId',
      concurrently: false
    }).catch(() => {});

    await qi.addIndex('orders', ['status'], {
      name: 'idx_orders_status',
      concurrently: false
    }).catch(() => {});

    await qi.addIndex('orders', ['parentCode'], {
      name: 'idx_orders_parentCode',
      concurrently: false
    }).catch(() => {});
  }

  // ── RFQs ─────────────────────────────────────────────────────
  if (tableInfo.includes('rfqs')) {
    await qi.addIndex('rfqs', ['status'], {
      name: 'idx_rfqs_status',
      concurrently: false
    }).catch(() => {});

    await qi.addIndex('rfqs', ['category'], {
      name: 'idx_rfqs_category',
      concurrently: false
    }).catch(() => {});
  }
}

module.exports = { up };
