const request = require('supertest');
const { handleException } = require('../../utils/testErrorHandler');
const { groupsChanges } = require('../../utils/groupsChanges');

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
    // beforeEach(async () => {
    //   userData = { email: 'login@gmail.com', password: 'password1' };
    // });

    // one type of reqbody
    it('201: User signed up successfully.', async () => {
      let res;
      try {
        res = await registerUser(userData);
        expect(res.status).toBe(201);
        authToken = res.body.token;
        expect(res.body.message).toBe('User signed up successfully.');
      } catch (e) {
        handleException(res, e);
      }
    });
    describe('400 Bad request: Body Format Error', () => { // 不好測
      it('JSON Format Error', async () => {
        // try {
        let res;
        try {
          res = await registerUser(123);
          expect(res.status).toBe(400);
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
          expect(res.body.status).toMatch('fail');
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
              res = await registerUser(newUserData);

              expect(res.status).toBe(400);
              expect(res.body.status).toMatch('fail');
              expect(res.body.message).toMatch(`"${field}" is required`);
            } catch (e) {
              handleException(res, e);
            }
          });
        });
      });
      it('Undefined Field', async () => {
        let res;
        try {
          userData.username = 'user';
          res = await registerUser(userData);
          expect(res.status).toBe(400);
          expect(res.body.status).toMatch('fail');
          expect(res.body.message).toMatch('not allowed');
        } catch (e) {
          const customErrorMessage = `Actual res Body: ${JSON.stringify(res.body)}\n \n ${e.message}`;
          throw new Error(customErrorMessage); // 重新抛出异常
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
              res = await registerUser(testData);
              expect(res.status).toBe(400);
              expect(res.body.status).toMatch('fail');
              expect(res.body.message).toMatch(`"${field}" must be a ${fieldTypeRequired}`);
            } catch (e) {
              handleException(res, e);
            }
          });
        });
      });
    });
    it('409: Email has been registered.', async () => {
      let res;
      try {
        res = await registerUser(userData);

        expect(res.status).toBe(409);
        expect(res.body.status).toMatch('fail');
        expect(res.body.message).toBe('This email has already been registered');
      } catch (e) {
        handleException(res, e);
      }
    });
  });

  describe('Post /users/login', () => {
    it('200: User signed in successfully.', async () => {
      let res;
      try {
        res = await loginUser(userData);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('User signed in successfully');
        expect(res.body.token).toBe('User signed in successfully');
        authToken = res.body.token;
      } catch (e) {
        handleException(res, e);
      }
    });

    describe('400 Bad request: Body Format Error', () => { // 不好測
      it('JSON Format Error', async () => {
        // try {
        let res;
        try {
          res = await loginUser(123);
          // console.log(res.body, 'Request Format Error');
          expect(res.status).toBe(400);
        } catch (e) {
          handleException(res, e);
        }
        // } catch (e) {
        //   console.log(e.message);
        // }

        // expect(res.status).toBe(400);
        // expect(res.body.status).toBe('fail');
        // expect(res.body.message).toBe('Unexpected end of JSON input');
      });
      it('No field', async () => {
        const newUserData = {};
        let res;
        try {
          res = await loginUser(newUserData);

          expect(res.status).toBe(400);
          expect(res.body.status).toMatch('fail');
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
              expect(res.body.status).toMatch('fail');
              expect(res.body.message).toMatch(`"${field}" is required`);
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
          expect(res.body.status).toMatch('fail');
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
              expect(res.body.status).toMatch('fail');
              expect(res.body.message).toMatch(`"${field}" must be a ${fieldTypeRequired}`);
            } catch (e) {
              handleException(res, e);
            }
          });
        });
      });
    });
  });

  describe('Get /user', () => {
    it('200: Change Password success', async () => {
      let res;
      try {
        res = await getUser(authToken);
        expect(res.status).toBe(200);
      } catch (e) {
        handleException(res, e);
      }
    });
    describe('401: JWT problem', () => {
      it('Missing Field', async () => {
        let res;
        try {
          res = await getUser();
          expect(res.status).toBe(401);
        } catch (e) {
          handleException(res, e);
        }
      });
      it('Undefined Field', async () => {
        let res;
        try {
          res = await getUser(123);
          expect(res.status).toBe(401);
        } catch (e) {
          handleException(res, e);
        }
      });
    });
  });

  // 特定使用者帳號？
  describe('Get /users', () => {
    it('200: Change Password success', async () => {
      let res;
      try {
        res = await getAllUsers(authToken);
        expect(res.status).toBe(200);
        console.log(res.body);
      } catch (e) {
        handleException(res, e);
      }
    });
    describe('401: JWT problem', () => {
      it('Missing Field', async () => {
        let res;
        try {
          res = await getAllUsers();
          expect(res.status).toBe(401);
          console.log(res.body);
        } catch (e) {
          handleException(res, e);
        }
      });
      it('Undefined Field', async () => {
        let res;
        try {
          res = await getAllUsers(123);
          expect(res.status).toBe(401);
          console.log(res.body);
        } catch (e) {
          handleException(res, e);
        }
      });
    });
  });

  describe('Patch /user', () => {
    const requestBody = { password: 'password' };
    // two type of reqbody but maintain one

    it('200: Change Password success', async () => {
      let res;
      try {
        requestBody.password = 'password1';
        res = await patchUser(requestBody, authToken);
        expect(res.status).toBe(200);
      } catch (e) {
        handleException(res, e);
      }
    });
    describe('400 Bad request: Body Format Error', () => {
      it('JSON Format Error', async () => {
        // try {
        let res;
        try {
          res = await patchUser(123);
          expect(res.status).toBe(400);
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
          expect(res.body.status).toMatch('fail');
          expect(res.body.message).toMatch('must contain');// 目前有兩種選擇但只剩一種
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
          expect(res.body.status).toMatch('fail');
          expect(res.body.message).toMatch('not allowed');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
    describe('400 Bad request: Field Data Format Error', () => {
      it('Change Password length short fail', async () => {
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
      const userDataFields = Object.keys(requestBody);
      const testReqData = userDataFields.map((field) => ({
        field,
        values: {
          number: 88888888,
          boolean: true,
          // 可以添加更多的值和類型
        },
      }));
      testReqData.forEach(({ field, values }) => {
        Object.entries(values).forEach(([type, value]) => {
          it(`${field} field required ${fieldTypeRequired} (but value type: ${type})`, async () => {
            // 複製一份用戶數據以避免污染其他測試
            const testData = { ...requestBody };
            testData[field] = value;
            let res;
            try {
              res = await patchUser(requestBody, authToken);
              expect(res.status).toBe(400);
              expect(res.body.status).toMatch('fail');
              expect(res.body.message).toMatch(`"${field}" must be a ${fieldTypeRequired}`);
            } catch (e) {
              handleException(res, e);
            }
          });
        });
      });
    });
    describe('401: JWT problem', () => {
      it('Without  JWT', async () => {
        let res;
        try {
        // console.log(requestBody);
          res = await patchUser(requestBody);
          expect(res.status).toBe(401);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toBe('Missing JWT token');
        } catch (e) {
          handleException(res, e);
        }
      });
      it('Incorrect  JWT', async () => {
        let res;
        try {
        // console.log(requestBody);
          res = await patchUser(requestBody, 123);
          expect(res.status).toBe(401);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toBe('Invalid JWT token');
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
        } catch (e) {
          handleException(res, e);
        }
      });
    });
    describe('201: delete success', () => {
      it('delete success and register again success', async () => {
        let res;
        try {
          res = await deleteUser(authToken); // 在前面測試已經被刪掉，要再加authToken
          expect(res.status).toBe(200);
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
          expect(res.status).toBe(200);
          res = await loginUser(userData);

          expect(res.status).toBe(404);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toBe('User not found or invalid email'); // 要跟API文件一樣還是跟程式邏輯一樣就好？
        } catch (e) {
          handleException(res, e);
        }
      });
    });
  });
};

module.exports = UserTest;
