require('dotenv').config();

const { API_VERSION } = process.env;

const express = require('express');

const app = express();

const logger = require('morgan');
const log = require('debug')('app:server');

// switch swagger mode
const swagger = require('./swaggers/config/swaggerSetup');

swagger.setupSwagger(app);

const indexRouter = require('./routes/index');
// api with api version
app.use(`/api/${API_VERSION}`, indexRouter);
// Redirect the root directory to the API documentation and hide api version
app.get('/', (req, res) => {
  res.redirect('/api-doc');
});
app.use('/', indexRouter);

const apiErrorHandler = require('./middlewares/errorHandler');

apiErrorHandler(app);
module.exports = app;
