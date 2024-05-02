const apiErrorHandler = (err, req, res, next) => {
  if (err) {
    err.statusCode = err.statusCode || 500; // if no statusCode is defined, then use HTTP500
    err.status = err.status || 'error';

    // return error status and message to the requester
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    next();
  }
};

module.exports = apiErrorHandler;
