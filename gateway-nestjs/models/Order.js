const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Supplier = require('./Supplier');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  parentCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  buyerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  tax: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  freight: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  total: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Escrow Funded'
  },
  dateCreated: {
    type: DataTypes.STRING,
    defaultValue: 'Today'
  },
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Supplier,
      key: 'id'
    }
  }
}, {
  tableName: 'orders',
  timestamps: true
});

// Associations
Order.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
Supplier.hasMany(Order, { foreignKey: 'supplierId', as: 'orders' });

module.exports = Order;
