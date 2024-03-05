const createRouter = require('./router');

const router = createRouter();

if (process.env.NODE_ENV === 'test') {
// Route that might cause an error
  router.get('/test', (req, res, next) => {
    next(new Error('Test error'));
  });
}

module.exports = router;
