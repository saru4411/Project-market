const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Product');

const PriceTier = sequelize.define('PriceTier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  min: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  max: {
    type: DataTypes.INTEGER,
    allowNull: true // Can be NULL for high open-ended tier (e.g. 5000+)
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: false
  }
}, {
  tableName: 'price_tiers',
  timestamps: true
});

// Associations
PriceTier.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(PriceTier, { foreignKey: 'productId', as: 'tiers' });

module.exports = PriceTier;
