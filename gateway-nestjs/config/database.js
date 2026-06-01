const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('./logger');

let sequelize;

if (process.env.DATABASE_URL) {
  logger.info('Production mode: Initializing enterprise PostgreSQL connection with connection pooling...');
  const useSSL = process.env.DATABASE_SSL === 'true';
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: useSSL ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    logging: false
  });
} else {
  const dbPath = path.resolve(__dirname, '..', 'database.db');
  logger.info({ msg: 'Local/Dev mode: Initializing serverless SQLite connection', path: dbPath });
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false
  });
}

module.exports = sequelize;
