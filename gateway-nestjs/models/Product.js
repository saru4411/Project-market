const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Supplier = require('./Supplier');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hub: {
    type: DataTypes.STRING,
    allowNull: false
  },
  weightPerUnit: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 1.0
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  images: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  hsn: {
    type: DataTypes.STRING,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  moq: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  leadTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
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
  tableName: 'products',
  timestamps: true
});

// Associations
Product.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
Supplier.hasMany(Product, { foreignKey: 'supplierId', as: 'products' });

module.exports = Product;
