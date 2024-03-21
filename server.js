require('dotenv').config();

const { API_VERSION } = process.env;

const jsonServer = require('json-server');

const app = jsonServer.create();

const logger = require('morgan');
const log = require('debug')('app:server');

const express = require('express');

app.use(logger('dev'));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

const apiErrorHandler = require('./middlewares/errorHandler');

apiErrorHandler(app);

module.exports = app;
