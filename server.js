require('dotenv').config();

const { API_VERSION } = process.env;

const jsonServer = require('json-server');

const app = jsonServer.create();

const logger = require('morgan');
const log = require('debug')('app:server');

const express = require('express');

// switch swagger mode
const swagger = require('./swaggers/config/swaggerSetup');

swagger.setupSwagger(app);

app.use(logger('dev'));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const indexRouter = require('./routes/index');

app.use('/', indexRouter);
app.use(`/api/${API_VERSION}`, indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).send('Page not found');
});

// error handler
app.use((err, req, res, next) => {
  log(err.stack);
  res.status(500).send('Internal Server Error');
});

module.exports = app;
