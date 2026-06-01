const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Rfq = require('./Rfq');

const Bid = sequelize.define('Bid', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rfqId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Rfq,
      key: 'id'
    }
  },
  supplierName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bidPrice: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  logisticsTerms: {
    type: DataTypes.STRING,
    allowNull: false
  },
  datePosted: {
    type: DataTypes.STRING,
    defaultValue: 'Just now'
  }
}, {
  tableName: 'bids',
  timestamps: true
});

// Associations
Bid.belongsTo(Rfq, { foreignKey: 'rfqId', as: 'rfq' });
Rfq.hasMany(Bid, { foreignKey: 'rfqId', as: 'bids' });

module.exports = Bid;
