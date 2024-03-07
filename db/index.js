const jsonServerDb = require('./jsonServerDb');
const mongodbDb = require('./mongoDb');

let db;

switch (process.env.DB_TYPE) {
  case 'json-server':
    db = jsonServerDb;
    break;
  case 'mongodb':
    db = mongodbDb;
    break;
  default:
    throw new Error('DB_TYPE is not set or not supported');
}

module.exports = db;
