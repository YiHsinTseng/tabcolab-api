require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const { authenticateJwt } = require('./middlewares/authenticate');
const apiErrorHandler = require('./middlewares/errorHandler');
const swagger = require('../swagger/config/swaggerSetup');
const {
  API_VERSION, PORT, SESSION_SECRET, CORS_WHITE_LIST,
} = require('./config/config');
require('./config/db');

const server = express();

const userRoutes = require('./routes/user');
const groupRoutes = require('./routes/group');
const itemRoutes = require('./routes/item');
const specItemRoutes = require('./routes/specItem');
const oauthRoutes = require('./routes/oauth');

// Redirect the root directory to the API documentation
server.get('/', (req, res) => {
  res.redirect('/api-doc');
});

swagger.setupSwagger(server);

server.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
  origin: CORS_WHITE_LIST,
  optionsSuccessStatus: 200,
  credentials: true, // 允許跨來源的 cookie
};

server.use(cors(corsOptions));

// 先添加不需要 JWT 驗證的路由
server.use(`/api/${API_VERSION}/oauth`, oauthRoutes);
server.use(`/api/${API_VERSION}`, userRoutes);

// 在所有其他路由之前添加 JWT 驗證中間件
server.use(authenticateJwt);
server.use(`/api/${API_VERSION}`, [groupRoutes, itemRoutes, specItemRoutes]);
apiErrorHandler(server);

server.listen(PORT, () => {
  console.log('Server is running');
});
