const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/config/swaggerSpecSetup');

// config
const {
  API_VERSION, PORT, SESSION_SECRET, corsOptions,
} = require('./config/config');
// db connection
require('./config/dbConnect');

const server = express();

// routes
const userRoutes = require('./src/routes/user');
const groupRoutes = require('./src/routes/group');
const itemRoutes = require('./src/routes/item');
const specItemRoutes = require('./src/routes/specItem');
const oauthRoutes = require('./src/routes/oauth');

// middlewares
const { authenticateJwt } = require('./src/middlewares/authenticate');
const pageNotFoundHandler = require('./src/middlewares/pageNotFoundHandler');
const apiErrorHandler = require('./src/middlewares/apiErrorHandler');

server.get('/', (req, res) => {
  res.redirect('/api-doc');
});
// swagger ui
server.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// middlewares
server.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

// cors
server.use(cors(corsOptions));

// oauth and user routes
server.use(`/api/${API_VERSION}/oauth`, oauthRoutes);
server.use(`/api/${API_VERSION}`, userRoutes);

// group, item, specItem routes, with JWT authentication middleware
server.use(`/api/${API_VERSION}/groups`, authenticateJwt, [groupRoutes, itemRoutes]);
server.use(`/api/${API_VERSION}/groups`, authenticateJwt, specItemRoutes);

// 404 error handler
server.use(pageNotFoundHandler);

// general error handler
server.use(apiErrorHandler);

server.listen(PORT, () => {
  console.log('Server is running');
});
