const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rfq = sequelize.define('Rfq', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetPrice: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  buyerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  buyerLocation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  datePosted: {
    type: DataTypes.STRING,
    defaultValue: 'Just now'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active (0 Bids)'
  }
}, {
  tableName: 'rfqs',
  timestamps: true
});

module.exports = Rfq;
