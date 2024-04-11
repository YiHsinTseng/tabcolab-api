require('dotenv').config();

const { API_VERSION } = process.env;

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { authenticateJwt } = require('../middlewares/authenticate');
const apiErrorHandler = require('../middlewares/errorHandler');
const swagger = require('../swaggers/config/swaggerSetup');

const server = express();

const userRoutes = require('../routes').user;
const groupRoutes = require('../routes').group;
const itemRoutes = require('../routes').item;

const {
  PROD_PORT, MONGODB_URI_LOCAL, MONGODB_URI_CLOUD, USE_CLOUD_DB,
} = process.env;

let MONGODB_URI;
if (USE_CLOUD_DB === 'true') {
  MONGODB_URI = MONGODB_URI_CLOUD;
} else {
  MONGODB_URI = MONGODB_URI_LOCAL;
}
console.log(MONGODB_URI);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Could not connect to MongoDB', err));

// Redirect the root directory to the API documentation
server.get('/', (req, res) => {
  res.redirect('/api-doc');
});

swagger.setupSwagger(server);

// 解析 JSON 請求主體
server.use(bodyParser.json());
// 解析 URL 編碼的請求主體
server.use(bodyParser.urlencoded({ extended: true }));
server.use(cors());

// api with api version
server.use(`/api/${API_VERSION}`, userRoutes);

// 在所有其他路由之前添加 JWT 驗證中間件
server.use(authenticateJwt);
server.use(`/api/${API_VERSION}`, groupRoutes);
server.use(`/api/${API_VERSION}`, itemRoutes);
apiErrorHandler(server);

server.listen(PROD_PORT, () => {
  console.log('Server is running');
});
