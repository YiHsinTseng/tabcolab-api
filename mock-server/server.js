require('dotenv').config();

const { API_VERSION } = process.env;

const jsonServer = require('json-server');
const express = require('express');
const apiErrorHandler = require('../middlewares/errorHandler');

const server = express();

const middlewares = jsonServer.defaults();

const indexRoutes = require('../routes/index');

// Redirect the root directory to the API documentation and hide api version
server.get('/', (req, res) => {
  res.redirect('/api-doc');
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

// switch swagger mode
const swagger = require('../swaggers/config/swaggerSetup');

swagger.setupSwagger(server);

// api with api version
server.use(`/api/${API_VERSION}`, indexRoutes);

apiErrorHandler(server);

server.listen(4000, () => {
  console.log('Server is running');
});
