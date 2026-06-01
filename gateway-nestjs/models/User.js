const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'buyer', // 'buyer', 'supplier', or 'admin'
    validate: {
      isIn: [['buyer', 'supplier', 'admin']]
    }
  },
  sellerStatus: {
    type: DataTypes.STRING,
    defaultValue: 'none' // 'none', 'pending_docs', 'pending_approval', 'approved'
  },
  isKycVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    defaultValue: 'Gujarat'
  },
  gstin: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  iso: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
