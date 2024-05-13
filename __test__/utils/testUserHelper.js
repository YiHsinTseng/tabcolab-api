function checkUUIDv4Format(value) {
  expect(value).toMatch(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[4][0-9a-fA-F]{3}\b-[89abAB][0-9a-fA-F]{3}\b-[0-9a-fA-F]{12}$/);
}

// Helper function to handle common test logic
async function testUserAction(action, args, expectedStatus, expectedBodyStatus, expectedMessage, messageCheck = 'toBe') {
  let res;
  let authToken = null;

  res = await action(...args);

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
  // Check all properties with '_id' in their names
  for (const key in res.body) {
    if (key.includes('_id')) {
      checkUUIDv4Format(res.body[key]);
    }
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

async function registerUserWithUniqueEmail(userData, registerUser) {
  // 使用一個新的、唯一的電子郵件地址
  const uniqueEmail = `test${Date.now()}@example.com`;
  const uniqueUserData = { ...userData, email: uniqueEmail };

  // 執行註冊操作
  await testUserAction(registerUser, [uniqueUserData], 201, 'success');

  return uniqueUserData;
}

module.exports = { testUserAction, testTokenValidity, registerUserWithUniqueEmail };
