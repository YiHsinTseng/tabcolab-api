const apiErrorHandler = (app) => {
  // TODO - Group not found 與此格式不同
  app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500; // if no statusCode is defined, then use HTTP500
    err.status = err.status || 'error';

    // return error status and message to the requester
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  });

  // 處理路徑不存在的中介軟體

  // error handler
  // app.use((err, req, res, next) => {
  //   log(err.stack);
  //   res.status(500).send('Internal Server Error');
  // });

  // catch 404 and forward to error handler
  // 404 route error is differnet from 500 error handler
  app.use((req, res, next) => {
    // res.status(404).send('Page not found');
    res.status(404).json({
      status: 'fail',
      message: 'Page not found',
    });
  });
};

module.exports = apiErrorHandler;
