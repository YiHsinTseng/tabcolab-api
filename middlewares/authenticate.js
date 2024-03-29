const passport = require('../configs/passport');

const authenticateJwt = passport.authenticate('jwt', { session: false });

module.exports = authenticateJwt;
