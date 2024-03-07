const express = require('express');
const jsonServer = require('json-server');

const env = process.env.NODE_ENV || 'development';

function createRouter() {
  let router;

  if (env === 'production') {
    router = express.Router();
  } else {
    router = jsonServer.create(); // use custom rule
  //  Use jsonServer's rule
  // const config = require('../configs/config.json');
  //   router = jsonServer.router(config[env].db.path);
  //   router.db._.id = 'group_id';
  }

  return router;
}

module.exports = createRouter;
