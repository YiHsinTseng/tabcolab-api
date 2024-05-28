const jwt = require('jsonwebtoken');

function verifyJwt(token, secretKey) {
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded !== null;
    } catch (e) {
        return false;
    }
}

module.exports = verifyJwt;