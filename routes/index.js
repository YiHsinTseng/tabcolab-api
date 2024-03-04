let router;
if (process.env.NODE_ENV === 'production') {
  const express = require('express');
  router = express.Router();
} else {
  const jsonServer = require('json-server');
  router = jsonServer.router('./mock-server/db.json');
  router.db._.id = 'group_id';
}

module.exports = router;
