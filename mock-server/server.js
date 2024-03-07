process.env.DB_TYPE = 'json-server';
const jsonServer = require('json-server');
const express = require('express');

const server = express();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const indexRoutes = require('../routes/index');

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use('/', indexRoutes);
server.use(router);

server.listen(4000, () => {
  console.log('Server is running');
});
