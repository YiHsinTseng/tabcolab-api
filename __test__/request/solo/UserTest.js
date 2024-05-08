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
    registerUser, loginUser, getUser, patchUser, deleteUser,
  } = require('../apis/usersAPI');

  // 要單一功能完整測試還是要交互？
  describe('Post /users/register', () => {
    // console.log(userData);
    it('201: User signed up successfully.', async () => {
      let response;
      try {
        response = await registerUser(userData);
        expect(response.status).toBe(201);
        authToken = response.body.token;
        expect(response.body.message).toBe('User signed up successfully.');
      } catch (e) {
        handleException(response, e);
      }
    });
    describe('400 Bad request: Body Format Error', () => { // 不好測
      it('Request Format Error', async () => {
        // try {
        let response;
        try {
          response = await registerUser(123);
          // console.log(response.body, 'Request Format Error');
          expect(response.status).toBe(400);
        } catch (e) {
          handleException(response, e);
        }
        // } catch (e) {
        //   console.log(e.message);
        // }

        // expect(response.status).toBe(400);
        // expect(response.body.status).toBe('fail');
        // expect(response.body.message).toBe('Unexpected end of JSON input');
      });
      it('email field', async () => {
        userData.email = 123;
        let response;
        try {
          response = await registerUser(userData);

          expect(response.status).toBe(400);
          expect(response.body.status).toMatch('fail');
          expect(response.body.message).toMatch('must be');
        } catch (e) {
          handleException(response, e);
        }
      });
      it('password field', async () => {
        userData.password = 123;
        let response;
        try {
          response = await registerUser(userData);

          expect(response.status).toBe(400);
          expect(response.body.status).toMatch('fail');
          expect(response.body.message).toMatch('must be');
        } catch (e) {
          handleException(response, e);
        }
      });
    });
    describe('400 Bad request: Field Error', () => {
      it('Missing Field', async () => {
        let response;
        try {
          const { password, ...newUserData } = userData;
          const response = await registerUser(newUserData);

          expect(response.status).toBe(400);
          expect(response.body.status).toMatch('fail');
          expect(response.body.message).toMatch('is required');
        } catch (e) {
          handleException(response, e);
        }
      });
      it('Undefined Field', async () => {
        let response;
        try {
          userData.username = 'user';
          response = await registerUser(userData);
          expect(response.status).toBe(400);
          expect(response.body.status).toMatch('fail');
          expect(response.body.message).toMatch('not allowed');
        } catch (e) {
          const customErrorMessage = `Actual Response Body: ${JSON.stringify(response.body)}\n \n ${e.message}`;
          throw new Error(customErrorMessage); // 重新抛出异常
        }
      });
    });
    it('409: Email has been registered.', async () => {
      let response;
      try {
        response = await registerUser(userData);

        expect(response.status).toBe(409);
        expect(response.body.status).toMatch('fail');
        expect(response.body.message).toBe('This email has already been registered');
      } catch (e) {
        handleException(response, e);
      }
    });
  });

  describe('Post /users/login', () => {
    it('200: User signed in successfully.', async () => {
      let response;
      try {
        response = await loginUser(userData);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User signed in successfully');
        expect(response.body.token).toBe('User signed in successfully');
        authToken = response.body.token;
      } catch (e) {
        handleException(response, e);
      }
    });

    describe('400 Bad request: Body Format Error', () => { // 不好測
      it('Request Format Error', async () => {
        // try {
        let response;
        try {
          response = await loginUser(123);
          // console.log(response.body, 'Request Format Error');
          expect(response.status).toBe(400);
        } catch (e) {
          handleException(response, e);
        }
        // } catch (e) {
        //   console.log(e.message);
        // }

        // expect(response.status).toBe(400);
        // expect(response.body.status).toBe('fail');
        // expect(response.body.message).toBe('Unexpected end of JSON input');
      });
      it('email field', async () => {
        userData.email = 123;
        let response;
        try {
          response = await loginUser(userData);

          expect(response.status).toBe(400);
          expect(response.body.status).toMatch('fail');
          expect(response.body.message).toMatch('must be');
        } catch (e) {
          handleException(response, e);
        }
      });
      it('password field', async () => {
        userData.password = 123;
        let response;
        try {
          response = await loginUser(userData);

          expect(response.status).toBe(400);
          expect(response.body.status).toMatch('fail');
          expect(response.body.message).toMatch('must be');
        } catch (e) {
          handleException(response, e);
        }
      });
    });
    describe('400 Bad request: Field Error', () => {
      it('Missing Field: {}', async () => {
        const newUserData = {};
        let response;
        try {
          response = await loginUser(newUserData);

          expect(response.status).toBe(400);
          expect(response.body.status).toMatch('fail');
          expect(response.body.message).toMatch('is required');
        } catch (e) {
          handleException(response, e);
        }
      });
      it('Missing Field', async () => {
        const { password, ...newUserData } = userData;
        let response;
        try {
          response = await loginUser(newUserData);

          expect(response.status).toBe(400);
          expect(response.body.status).toMatch('fail');
          expect(response.body.message).toMatch('is required');
        } catch (e) {
          handleException(response, e);
        }
      });
      it('Undefined Field', async () => {
        userData.username = 'user';
        let response;
        try {
          response = await loginUser(userData);

          expect(response.status).toBe(400);
          expect(response.body.status).toMatch('fail');
          expect(response.body.message).toMatch('not allowed');
        } catch (e) {
          handleException(response, e);
        }
      });
    });
  });

  describe('Get /users', () => {
    it('200: Change Password success', async () => {
      let response;
      try {
        response = await getUser(authToken);
        expect(response.status).toBe(200);
      } catch (e) {
        handleException(response, e);
      }
    });
    describe('401: JWT problem', () => {
      it('Missing Field', async () => {
        let response;
        try {
          response = await getUser();
          expect(response.status).toBe(401);
        } catch (e) {
          handleException(response, e);
        }
      });
      it('Undefined Field', async () => {
        let response;
        try {
          response = await getUser(123);
          expect(response.status).toBe(401);
        } catch (e) {
          handleException(response, e);
        }
      });
    });
  });

  describe('Patch /user', () => {
    const requestBody = { password: 'password' };

    it('200: Change Password success', async () => {
      let response;
      try {
        requestBody.password = 'password1';
        response = await patchUser(requestBody, authToken);
        expect(response.status).toBe(200);
      } catch (e) {
        handleException(response, e);
      }
    });
    describe('400 Bad request: Field Error', () => {
      it('Change Password length short fail', async () => {
        let response;
        try {
          requestBody.password = 'p';
          // console.log(requestBody);
          response = await patchUser(requestBody, authToken);
          expect(response.status).toBe(400);
        } catch (e) {
          handleException(response, e);
        }
      });
    });

    describe('400 Bad request: Body Format Error', () => {
      it('Request Format Error', async () => {
        // try {
        let response;
        try {
          response = await patchUser(123);
          expect(response.status).toBe(400);
        } catch (e) {
          handleException(response, e);
        }
      });
      it('Missing Field', async () => {
        const newUserData = {};
        let response;
        try {
          response = await patchUser(newUserData, authToken);

          expect(response.status).toBe(400);
          expect(response.body.status).toMatch('fail');
          expect(response.body.message).toMatch('is required');
        } catch (e) {
          handleException(response, e);
        }
      });
      it('Undefined Field', async () => {
        userData.username = 'user';
        let response;
        try {
          response = await patchUser(userData, authToken);

          expect(response.status).toBe(400);
          expect(response.body.status).toMatch('fail');
          expect(response.body.message).toMatch('not allowed');
        } catch (e) {
          handleException(response, e);
        }
      });
    });
    describe('401: JWT problem', () => {
      it('Without  JWT', async () => {
        let response;
        try {
        // console.log(requestBody);
          response = await patchUser(requestBody);
          expect(response.status).toBe(401);
          expect(response.body.status).toBe('fail');
          expect(response.body.message).toBe('Missing JWT token');
        } catch (e) {
          handleException(response, e);
        }
      });
      it('Incorrect  JWT', async () => {
        let response;
        try {
        // console.log(requestBody);
          response = await patchUser(requestBody, 123);
          expect(response.status).toBe(401);
          expect(response.body.status).toBe('fail');
          expect(response.body.message).toBe('Invalid JWT token');
        } catch (e) {
          handleException(response, e);
        }
      });
    });
  });
  describe('Delete /user', () => {
    describe('401: JWT problem', () => {
      it('delete without authToken', async () => {
        let response;
        try {
          response = await deleteUser();
          expect(response.status).toBe(401);
        } catch (e) {
          handleException(response, e);
        }
      });
      it('delete with incorrect authToken', async () => {
        let response;
        try {
          response = await deleteUser(123);
          expect(response.status).toBe(401);
        } catch (e) {
          handleException(response, e);
        }
      });
    });
    describe('201: delete success', () => {
      it('delete success and register again success', async () => {
        let response;
        try {
          response = await deleteUser(authToken); // 在前面測試已經被刪掉，要再加authToken
          expect(response.status).toBe(200);
          response = await registerUser(userData);
          authToken = response.body.token;
          expect(response.status).toBe(201);
        } catch (e) {
          handleException(response, e);
        }
      });
      it('delete success and login again fail', async () => {
        let response;
        try {
          response = await deleteUser(authToken);
          expect(response.status).toBe(200);
          response = await loginUser(userData);

          expect(response.status).toBe(404);
          expect(response.body.status).toBe('fail');
          expect(response.body.message).toBe('User not found or invalid email'); // 要跟API文件一樣還是跟程式邏輯一樣就好？
        } catch (e) {
          handleException(response, e);
        }
      });
    });
  });
};

module.exports = UserTest;
