const express = require('express');

const logger = require('morgan');
const log = require('debug')('app:server');

const indexRouter = require('./routes/index');

const app = express();

app.use(logger('dev'));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);

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
