const request = require('supertest');
const { handleException } = require('../../utils/testErrorHandler');
const { groupsChanges } = require('../../utils/groupsChanges');
const verifyJwt = require('../../utils/verifyJwt');

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
    it('201: User signed up successfully.', async () => {
      let res;
      try {
        res = await registerUser(userData);
        expect(res.status).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.message).toBe('User signed up successfully.');
        expect(res.body.token).toBeDefined();
        authToken = res.body.token;
      } catch (e) {
        handleException(res, e);
      }
    });
    it('Token is valid', async () => {
      try {
        // Verify the token
        const isValidJwt = verifyJwt(authToken, process.env.PASSPORT_SECRET);
        expect(isValidJwt).toBe(true);
      } catch (e) {
        throw e;
      }
    });
    describe('400 Bad request: Body Format Error', () => {
      it('JSON Format Error', async () => {
        let invalidJson = '{ "email": 123, }';
        let res;
        try {
          res = await registerUser(invalidJson);
          expect(res.status).toBe(400);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toBe('Invalid JSON format in request body');
        } catch (e) {
          handleException(res, e);
        }
      });
      it('No field', async () => {
        let res;
        const newUserData = {};
        try {
          res = await registerUser(newUserData);

          expect(res.status).toBe(400);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toMatch('is required');
        } catch (e) {
          handleException(res, e);
        }
      });
      it('Undefined Field', async () => {
        let res;
        try {
          userData.username = 'user';
          res = await registerUser(userData);
          expect(res.status).toBe(400);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toMatch('not allowed');
        } catch (e) {
          const customErrorMessage = `Actual res Body: ${JSON.stringify(res.body)}\n \n ${e.message}`;
          throw new Error(customErrorMessage);
        }
      });
      describe('Missing field', () => {
        const testData = Object.keys(userData);
        testData.forEach((field) => {
          it(`Missing ${field} field`, async () => {
            let res;
            try {
              const { [field]: removedField, ...newUserData } = userData;
              res = await registerUser(newUserData);

              expect(res.status).toBe(400);
              expect(res.body.status).toBe('fail');
              expect(res.body.message).toBe(`"${field}" is required`);
            } catch (e) {
              handleException(res, e);
            }
          });
        });
      });

    });
    describe('400 Bad request: Field Data Format Error', () => {
      const fieldTypeRequired = 'string';
      const userDataFields = Object.keys(userData);
      const testReqData = userDataFields.map((field) => ({
        field,
        values: {
          number: 123,
          boolean: true,
          // 可以添加更多的值和類型
        },
      }));
      testReqData.forEach(({ field, values }) => {
        Object.entries(values).forEach(([type, value]) => {
          it(`${field} field required ${fieldTypeRequired} (but value type: ${type})`, async () => {
            // 複製一份用戶數據以避免污染其他測試
            const testData = { ...userData };
            testData[field] = value;
            let res;
            try {
              res = await registerUser(testData);
              expect(res.status).toBe(400);
              expect(res.body.status).toBe('fail');
              expect(res.body.message).toBe(`"${field}" must be a ${fieldTypeRequired}`);
            } catch (e) {
              handleException(res, e);
            }
          });
        });
      });
    });
    describe('409 Conflict: Email has been registered.', () => {
      it('409: Email has been registered.', async () => {
        let res;
        try {
          res = await registerUser(userData);

          expect(res.status).toBe(409);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toBe('This email has already been registered');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
  });

  describe('Post /users/login', () => {
    it('200: User signed in successfully.', async () => {
      let res;
      try {
        res = await loginUser(userData);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.message).toBe('User signed in successfully');
        expect(res.body.token).toBeDefined();
        authToken = res.body.token;
      } catch (e) {
        handleException(res, e);
      }
    });
    it('Token is valid', async () => {
      try {
        // Verify the token
        const isValidJwt = verifyJwt(authToken, process.env.PASSPORT_SECRET);
        expect(isValidJwt).toBe(true);
      } catch (e) {
        throw e;
      }
    });

    describe('400 Bad request: Body Format Error', () => {
      it('JSON Format Error', async () => {
        let invalidJson = '{ "email" }';
        let res;
        try {
          res = await loginUser(invalidJson);
          expect(res.status).toBe(400);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toBe('Invalid JSON format in request body');
        } catch (e) {
          handleException(res, e);
        }
      });
      it('No field', async () => {
        const newUserData = {};
        let res;
        try {
          res = await loginUser(newUserData);

          expect(res.status).toBe(400);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toMatch('is required');
        } catch (e) {
          handleException(res, e);
        }
      });
      describe('Missing field', () => {
        const testData = Object.keys(userData);
        testData.forEach((field) => {
          it(`Missing ${field} field`, async () => {
            let res;
            try {
              const { [field]: removedField, ...newUserData } = userData;
              res = await loginUser(newUserData);

              expect(res.status).toBe(400);
              expect(res.body.status).toBe('fail');
              expect(res.body.message).toBe(`"${field}" is required`);
            } catch (e) {
              handleException(res, e);
            }
          });
        });
      });
      it('Undefined Field', async () => {
        userData.username = 'user';
        let res;
        try {
          res = await loginUser(userData);

          expect(res.status).toBe(400);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toMatch('not allowed');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
    describe('400 Bad request: Field Data Format Error', () => {
      const fieldTypeRequired = 'string';
      const userDataFields = Object.keys(userData);
      const testReqData = userDataFields.map((field) => ({
        field,
        values: {
          number: 123,
          boolean: true,
          // 可以添加更多的值和類型
        },
      }));
      testReqData.forEach(({ field, values }) => {
        Object.entries(values).forEach(([type, value]) => {
          it(`${field} field required ${fieldTypeRequired} (but value type: ${type})`, async () => {
            // 複製一份用戶數據以避免污染其他測試
            const testData = { ...userData };
            testData[field] = value;
            let res;
            try {
              res = await loginUser(testData);
              expect(res.status).toBe(400);
              expect(res.body.status).toBe('fail');
              expect(res.body.message).toBe(`"${field}" must be a ${fieldTypeRequired}`);
            } catch (e) {
              handleException(res, e);
            }
          });
        });
      });
    });
  });

  describe('Get /user', () => {
    it('200: Get user info', async () => {
      let res;
      try {
        res = await getUser(authToken);
        expect(res.status).toBe(200);
      } catch (e) {
        handleException(res, e);
      }
    });
    describe('401: JWT problem', () => {
      it('Missing JWT', async () => {
        let res;
        try {
          res = await getUser();
          expect(res.status).toBe(401);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toBe('Missing JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
      it('Invalid JWT', async () => {
        let res;
        try {
          res = await getUser(123);
          expect(res.status).toBe(401);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toBe('Invalid JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
  });

  // 特定使用者帳號？
  describe('Get /users', () => {
    it('200: Get all user info (only admin)', async () => {
      const adminData = { email: 'admin123@gmail.com', password: 'admin123' };

      let res;
      try {
        const adminLogin = await registerUser(adminData);
        const adminToken = adminLogin.body.token;

        res = await getAllUsers(adminToken);
        expect(res.status).toBe(200);
      } catch (e) {
        handleException(res, e);
      }
    });
    describe('401: JWT problem', () => {
      it('Missing JWT', async () => {
        let res;
        try {
          res = await getAllUsers();
          expect(res.status).toBe(401);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toBe('Missing JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
      it('Invalid JWT', async () => {
        let res;
        try {
          res = await getAllUsers(123);
          expect(res.status).toBe(401);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toBe('Invalid JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
    describe('403: Access denied', () => {
      it('Not an admin, denied access', async () => {
        let res;
        try {
          res = await getAllUsers(authToken);
          expect(res.status).toBe(403);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toBe('Access denied. You are not an admin.');
        } catch (e) {
          handleException(res, e);
        }
      })
    });
  });

  describe('Patch /user', () => {
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
        res = await patchUser(requestBody, authToken);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.message).toBe('User password updated successfully');
      } catch (e) {
        handleException(res, e);
      }
    });
    it('200: Can login with new password', async () => {
      let loginRequestBody = { email: 'test123@gmail.com', password: 'test1234' };
      let res;
      try {
        res = await loginUser(loginRequestBody);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.message).toBe('User signed in successfully');
      } catch (e) {
        handleException(res, e);
      }
    });
    it('200: Change Email success', async () => {
      requestBody = {};
      let res;
      try {
        requestBody.email = 'test1234@gmail.com'
        res = await patchUser(requestBody, authToken);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.message).toBe('User info updated successfully');
      } catch (e) {
        handleException(res, e);
      }
    });
    it('200: Can login with new email', async () => {
      let loginRequestBody = { email: 'test1234@gmail.com', password: 'test1234' };
      let res;
      try {
        res = await loginUser(loginRequestBody);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.message).toBe('User signed in successfully');
      } catch (e) {
        handleException(res, e);
      }
    });
    describe('400 Bad request: Body Format Error', () => {
      it('JSON Format Error', async () => {
        let invalidJson = '{ password: }';
        let res;
        try {
          res = await patchUser(invalidJson, authToken);
          expect(res.status).toBe(400);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toBe('Invalid JSON format in request body');
        } catch (e) {
          handleException(res, e);
        }
      });
      it('No field', async () => {
        let res;
        const newUserData = {};
        try {
          res = await patchUser(newUserData, authToken);

          expect(res.status).toBe(400);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toMatch('must contain');
        } catch (e) {
          handleException(res, e);
        }
      });
      it('Undefined Field', async () => {
        requestBody.username = 'user';
        let res;
        try {
          res = await patchUser(requestBody, authToken);

          expect(res.status).toBe(400);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toMatch('not allowed');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
    describe('400 Bad request: Field Data Format Error', () => {
      it('Password length short fail', async () => {
        let res;
        try {
          requestBody.password = 'p';
          // console.log(requestBody);
          res = await patchUser(requestBody, authToken);
          expect(res.status).toBe(400);
        } catch (e) {
          handleException(res, e);
        }
      });

      const fieldTypeRequired = 'string';
      const testReqData = ['email', 'password'].map((field) => ({
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
              res = await patchUser(testData, authToken);
              expect(res.status).toBe(400);
              expect(res.body.status).toBe('fail');
              expect(res.body.message).toBe(`"${field}" must be a ${fieldTypeRequired}`);
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
          // console.log(requestBody);
          res = await patchUser(requestBody);
          expect(res.status).toBe(401);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toBe('Missing JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
      it('Invalid JWT', async () => {
        let res;
        try {
          // console.log(requestBody);
          res = await patchUser(requestBody, 123);
          expect(res.status).toBe(401);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toBe('Invalid JWT');
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
          res = await deleteUser();
          expect(res.status).toBe(401);
        } catch (e) {
          handleException(res, e);
        }
      });
      it('delete with incorrect authToken', async () => {
        let res;
        try {
          res = await deleteUser(123);
          expect(res.status).toBe(401);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toBe('Invalid JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
    describe('204: delete success', () => {
      it('delete success and register again success', async () => {
        let res;
        try {
          res = await deleteUser(authToken); // 在前面測試已經被刪掉，要再加authToken
          expect(res.status).toBe(204);
          res = await registerUser(userData);
          authToken = res.body.token;
          expect(res.status).toBe(201);
        } catch (e) {
          handleException(res, e);
        }
      });
      it('delete success and login again fail', async () => {
        let res;
        try {
          res = await deleteUser(authToken);
          expect(res.status).toBe(204);
          res = await loginUser(userData);

          expect(res.status).toBe(404);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toBe('User not found or invalid email');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
  });
};

module.exports = UserTest;
