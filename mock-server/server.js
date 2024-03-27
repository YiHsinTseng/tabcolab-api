require('dotenv').config();

const { API_VERSION } = process.env;

const jsonServer = require('json-server');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiErrorHandler = require('../middlewares/errorHandler');
// switch swagger mode
const swagger = require('../swaggers/config/swaggerSetup');

const server = express();

const middlewares = jsonServer.defaults();

const indexRoutes = require('../routes/index');

// Redirect the root directory to the API documentation and hide api version
server.get('/', (req, res) => {
  res.redirect('/api-doc');
});

swagger.setupSwagger(server);
server.use(middlewares);
// server.use(jsonServer.bodyParser);
// 解析 JSON 請求主體
server.use(bodyParser.json());
// 解析 URL 編碼的請求主體
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static('public'));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(cors());

// api with api version
server.use(`/api/${API_VERSION}`, indexRoutes);

apiErrorHandler(server);

server.listen(4000, () => {
  console.log('Server is running');
});
