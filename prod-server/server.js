require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { authenticateJwt } = require('../middlewares/authenticate');
const apiErrorHandler = require('../middlewares/errorHandler');
const swagger = require('../swaggers/config/swaggerSetup');

const server = express();

// 靜態文件服務器中間件應該在所有其他中間件和路由之前應用
server.use('/oauthLogin.html', express.static(path.join(__dirname, '../oauthLogin.html')));

const userRoutes = require('../routes').user;
const groupRoutes = require('../routes').group;
const itemRoutes = require('../routes').item;
const specItemRoutes = require('../routes').specItem;
const oauthRoutes = require('../routes').oauth;

const {
  API_VERSION, PROD_PORT, MONGODB_URI_LOCAL, MONGODB_URI_CLOUD, USE_CLOUD_DB, SESSION_SECRET,
} = process.env;

let MONGODB_URI;
if (USE_CLOUD_DB === 'true') {
  MONGODB_URI = MONGODB_URI_CLOUD;
} else {
  MONGODB_URI = MONGODB_URI_LOCAL;
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Could not connect to MongoDB', err));

// Redirect the root directory to the API documentation
server.get('/', (req, res) => {
  res.redirect('/api-doc');
});

swagger.setupSwagger(server);

// Use the session middleware
server.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }));
// 解析 JSON 請求主體
server.use(bodyParser.json());

// 解析 URL 編碼的請求主體
server.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
  origin: ['http://13.115.132.26', 'https://13.115.132.26', 'http://www.tabcolab.live', 'https://www.tabcolab.live', 'http://tabcolab.live', 'https://tabcolab.live', 'http://d1d8qny6cjcfu0.cloudfront.net', 'https://d1d8qny6cjcfu0.cloudfront.net', 'http://localhost:4000', 'chrome-extension://aiiffbafnfldcklcghpokbogbiopkagp', 'chrome-extension://gfledkccocicmdgnjeafbnffcimdfonb', 'chrome-extension://okaekjldpoogggmmfagcfeglbgbbihfp'],
  optionsSuccessStatus: 200,
  credentials: true, // 允許跨來源的 cookie
};

server.use(cors(corsOptions));

// 先添加不需要 JWT 驗證的路由
server.use(`/api/${API_VERSION}/oauth`, oauthRoutes);
server.use(`/api/${API_VERSION}`, userRoutes);

// 在所有其他路由之前添加 JWT 驗證中間件
server.use(authenticateJwt);
server.use(`/api/${API_VERSION}`, groupRoutes);
server.use(`/api/${API_VERSION}`, itemRoutes);
server.use(`/api/${API_VERSION}`, specItemRoutes);
apiErrorHandler(server);

server.listen(PROD_PORT, () => {
  console.log('Server is running');
});
