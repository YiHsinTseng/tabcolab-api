require('dotenv').config();

const { API_VERSION, DEV_PORT } = process.env;

const jsonServer = require('json-server');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { authenticateJwt } = require('../middlewares/authenticate');
const apiErrorHandler = require('../middlewares/errorHandler');
const swagger = require('../swaggers/config/swaggerSetup');

const server = express();

const middlewares = jsonServer.defaults();

const userRoutes = require('../routes').user;
const groupRoutes = require('../routes').group;
const itemRoutes = require('../routes').item;
const specItemRoutes = require('../routes').specItem;

// Redirect the root directory to the API documentation
server.get('/', (req, res) => {
  res.redirect('/api-doc');
});

swagger.setupSwagger(server);

server.use(middlewares);
// 解析 JSON 請求主體
server.use(bodyParser.json());
// 解析 URL 編碼的請求主體
server.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
  origin: ['http://13.115.132.26', 'https://13.115.132.26', 'http://www.tabcolab.live', 'https://www.tabcolab.live', 'http://tabcolab.live', 'https://tabcolab.live', 'http://d1d8qny6cjcfu0.cloudfront.net', 'https://d1d8qny6cjcfu0.cloudfront.net'],
  optionsSuccessStatus: 200,
};

server.use(cors(corsOptions));

// api with api version
server.use(`/api/${API_VERSION}`, userRoutes);

// 在所有其他路由之前添加 JWT 驗證中間件
server.use(authenticateJwt);
server.use(`/api/${API_VERSION}`, groupRoutes);
server.use(`/api/${API_VERSION}`, itemRoutes);
server.use(`/api/${API_VERSION}`, specItemRoutes);
apiErrorHandler(server);

server.listen(DEV_PORT, () => {
  console.log('Server is running');
});
