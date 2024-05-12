const request = require('supertest');
const { handleException } = require('../../utils/testErrorHandler');
const { testUserAction, testTokenValidity, registerUserWithUniqueEmail } = require('../../utils/testUserHelper');
const { UserRequestBodyTest } = require('../../classes/UserTest');

let userData = { email: 'login@gmail.com', password: 'password1' };

const UserTest = async (server) => {
  let authToken;

  beforeEach(async () => {
    userData = { email: 'login@gmail.com', password: 'password1' };
  });

  const {
    registerUser, loginUser, getUser, getAllUsers, patchUser, deleteUser,
  } = require('../apis/usersAPI');

  describe('Post /users/register', () => {
    const userTest = new UserRequestBodyTest(registerUser, userData);
    it('201: User signed up successfully.', async () => {
      try {
        res = await testUserAction(registerUser, [userData], 201, 'success', 'User signed up successfully.');
        authToken = res.body.token;
      } catch (e) {
        handleException(res, e);
      }
    });
    it('Token is valid', async () => {
      await testTokenValidity(authToken);
    });
    describe('400 Bad request: Body Format Error', () => {

      it('JSON Format Error', async () => {
        const invalidJson = '{ "email":123;}';
        await userTest.jsonFormatError(invalidJson);
      });
      it('No field', async () => {
        await userTest.noField();
      });
      it('Undefined Field', async () => {
        await userTest.undefinedField();
      });
      describe('Missing field', () => {
        userTest.missingField();
      });

    });
    describe('400 Bad request: Field Data Format Error', () => {
      userTest.fieldDataFormatError();

    });
    describe('409 Conflict: Email has been registered.', () => {
      it('409: Email has been registered.', async () => {
        let res;
        try {
          const uniqueUserData = await registerUserWithUniqueEmail(userData, registerUser);

          // 再次使用相同的電子郵件地址嘗試註冊，預期會收到一個 409 錯誤
          res = await testUserAction(registerUser, [uniqueUserData], 409, 'fail', 'This email has already been registered');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
  });

  describe('Post /users/login', () => {
    const userTest = new UserRequestBodyTest(loginUser, userData);
    it('200: User signed in successfully.', async () => {
      let res;
      try {
        res = await testUserAction(loginUser, [userData], 200, 'success', 'User signed in successfully');
        authToken = res.body.token;
      } catch (e) {
        handleException(res, e);
      }
    });
    it('Token is valid', async () => {
      await testTokenValidity(authToken);
    });

    describe('400 Bad request: Body Format Error', () => {
      it('JSON Format Error', async () => {
        const invalidJson = '{ "email" }';
        await userTest.jsonFormatError(invalidJson);
      });
      it('No field', async () => {
        await userTest.noField();
      });
      describe('Missing field', () => {
        userTest.missingField();
      });
      it('Undefined Field', async () => {
        await userTest.undefinedField();
      });
    });
    describe('400 Bad request: Field Data Format Error', () => {
      userTest.fieldDataFormatError();
    });
  });

  describe('Get /user', () => {
    it('200: Get user info', async () => {
      let res;
      try {
        res = await testUserAction(getUser, [authToken], 200);
      } catch (e) {
        handleException(res, e);
      }
    });
    describe('401: JWT problem', () => {
      it('Missing JWT', async () => {
        let res;
        try {
          res = await testUserAction(getUser, [], 401, 'fail', 'Missing JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
      it('Invalid JWT', async () => {
        let res;
        try {
          res = await testUserAction(getUser, [123], 401, 'fail', 'Invalid JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
  });
  describe('Get /users', () => {
    it('200: Get all user info (only admin)', async () => {
      const adminData = { email: 'admin123@gmail.com', password: 'admin123' };

      let res;
      try {
        const adminLogin = await registerUser(adminData);
        const adminToken = adminLogin.body.token;
        res = await testUserAction(getAllUsers, [adminToken], 200);
      } catch (e) {
        handleException(res, e);
      }
    });
    describe('401: JWT problem', () => {
      it('Missing JWT', async () => {
        let res;
        try {
          res = await testUserAction(getAllUsers, [], 401, 'fail', 'Missing JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
      it('Invalid JWT', async () => {
        let res;
        try {
          res = await testUserAction(getAllUsers, [123], 401, 'fail', 'Invalid JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
    describe('403: Access denied', () => {
      it('Not an admin, denied access', async () => {
        let res;
        try {
          res = await testUserAction(getAllUsers, [authToken], 403, 'fail', 'Access denied. You are not an admin.');
        } catch (e) {
          handleException(res, e);
        }
      })
    });
  });

  describe('Patch /user', () => {
    const userTest = new UserRequestBodyTest(patchUser, userData);

    let authToken;

    beforeAll(async () => {
      let registerRequestBody = { email: 'test123@gmail.com', password: 'test123' };
      let registerResponse = await registerUser(registerRequestBody);
      authToken = registerResponse.body.token;
    });

    let requestBody = {};
    it('200: Change Password success', async () => {
      let res;
      try {
        requestBody.password = 'test1234';
        res = await testUserAction(patchUser, [requestBody, authToken], 200, 'success', 'User password updated successfully');
      } catch (e) {
        handleException(res, e);
      }
    });
    it('200: Can login with new password', async () => {
      let loginRequestBody = { email: 'test123@gmail.com', password: 'test1234' };
      let res;
      try {
        res = await testUserAction(loginUser, [loginRequestBody], 200, 'success', 'User signed in successfully');
      } catch (e) {
        handleException(res, e);
      }
    });
    it('200: Change Email success', async () => {
      requestBody = {};
      let res;
      try {
        requestBody.email = 'test1234@gmail.com'
        res = await testUserAction(patchUser, [requestBody, authToken], 200, 'success', 'User info updated successfully');
      } catch (e) {
        handleException(res, e);
      }
    });
    it('200: Can login with new email', async () => {
      let loginRequestBody = { email: 'test1234@gmail.com', password: 'test1234' };
      let res;
      try {
        res = await testUserAction(loginUser, [loginRequestBody], 200, 'success', 'User signed in successfully');
      } catch (e) {
        handleException(res, e);
      }
    });
    describe('400 Bad request: Body Format Error', () => {
      it('JSON Format Error', async () => {
        const invalidJson = '{ password: }';
        await userTest.jsonFormatError(invalidJson);
      });
      it('No field', async () => {
        await userTest.noField({}, authToken, 'must contain');
      });
      it('Undefined Field', async () => {
        await userTest.undefinedField(authToken);
      });
    });
    describe('400 Bad request: Field Data Format Error', () => {
      it('Password length short fail', async () => {
        let res;
        const originalPassword = requestBody.password;
        try {
          requestBody.password = 'p';
          res = await testUserAction(patchUser, [requestBody, authToken], 400, 'fail', 'must be at least 6 characters long', 'toMatch');
        } catch (e) {
          handleException(res, e);
        } finally {
          requestBody.password = originalPassword;
        }
      });
      it('email should be email format', async () => {
        let res;
        const originalEmail = requestBody.email;
        try {
          requestBody.email = 'test1234';
          res = await testUserAction(patchUser, [requestBody, authToken], 400, 'fail', 'must be a valid email', 'toMatch');
        } catch (e) {
          handleException(res, e);
        } finally {
          requestBody.email = originalEmail;
        }
      });

      // 測試所有字段的類型是否正確
      const fieldTypeRequired = 'string';
      const userDataFields = Object.keys(userData);
      const testReqData = userDataFields.map((field) => ({
        field,
        values: {
          number: 88888888,
          boolean: true,
        },
      }));
      testReqData.forEach(({ field, values }) => {
        Object.entries(values).forEach(([type, value]) => {
          it(`${field} field required ${fieldTypeRequired} (but value type: ${type})`, async () => {
            // 複製一份用戶數據以避免污染其他測試
            const testData = {
              email: requestBody.email,
              password: requestBody.password
            };
            testData[field] = value;

            let res;
            try {
              res = await testUserAction(patchUser, [testData, authToken], 400, 'fail', `"${field}" must be a ${fieldTypeRequired}`);
            } catch (e) {
              handleException(res, e);
            }
          });
        });
      });
    });
    describe('401: JWT problem', () => {
      it('Missing JWT', async () => {
        let res;
        try {
          res = await testUserAction(patchUser, [requestBody], 401, 'fail', 'Missing JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
      it('Invalid JWT', async () => {
        let res;
        try {
          res = await testUserAction(patchUser, [requestBody, 123], 401, 'fail', 'Invalid JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
  });
  describe('Delete /user', () => {
    describe('401: JWT problem', () => {
      it('delete without authToken', async () => {
        let res;
        try {
          res = await testUserAction(deleteUser, [], 401);
        } catch (e) {
          handleException(res, e);
        }
      });
      it('delete with incorrect authToken', async () => {
        let res;
        try {
          res = await testUserAction(deleteUser, [123], 401, 'fail', 'Invalid JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
    describe('204: delete success', () => {
      it('delete success and register again success', async () => {
        let res;
        try {
          res = await testUserAction(deleteUser, [authToken], 204); // 在前面測試已經被刪掉，要再加authToken
          res = await testUserAction(registerUser, [userData], 201, 'success', 'User signed up successfully.');
          authToken = res.body.token;
        } catch (e) {
          handleException(res, e);
        }
      });
      it('delete success and login again fail', async () => {
        let res;
        try {
          res = await testUserAction(deleteUser, [authToken], 204)
          res = await testUserAction(loginUser, [userData], 404, 'fail', 'User not found or invalid email');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
  });
};

module.exports = UserTest;
