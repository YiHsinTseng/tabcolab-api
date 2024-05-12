// Helper function to handle common test logic
async function testUserAction(action, args, expectedStatus, expectedBodyStatus, expectedMessage, messageCheck = 'toBe') {
    let res;
    let authToken = null;

    res = await action(...args);

    if (!res || !res.body) {
        throw new Error('Response or response body is undefined');
    }
    expect(res.status).toBe(expectedStatus);
    if (expectedBodyStatus) {
        expect(res.body.status).toBe(expectedBodyStatus);
    }
    if (expectedMessage) {
        expect(res.body.message)[messageCheck](expectedMessage);
    }
    if (res.body.token) {
        authToken = res.body.token;
        expect(authToken).toBeDefined();
    }

    return res;
}

const verifyJwt = require('./verifyJwt');

// Helper function to verify JWT token
async function testTokenValidity(token) {
    try {
        // Verify the token
        const isValidJwt = verifyJwt(token, process.env.PASSPORT_SECRET);
        expect(isValidJwt).toBe(true);
    } catch (e) {
        throw e;
    }
}



module.exports = { testUserAction, testTokenValidity };