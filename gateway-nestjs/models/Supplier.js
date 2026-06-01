const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supplier = sequelize.define('Supplier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  joined: {
    type: DataTypes.STRING,
    defaultValue: 'Joined Today'
  },
  trustScore: {
    type: DataTypes.STRING,
    defaultValue: '100%'
  },
  responseTime: {
    type: DataTypes.STRING,
    defaultValue: '< 1 Hour'
  },
  gstin: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  iso: {
    type: DataTypes.STRING,
    defaultValue: 'ISO Certified MSME'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'suppliers',
  timestamps: true
});

module.exports = Supplier;
