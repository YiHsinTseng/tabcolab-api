const request = require('supertest');

let userData = { email: 'login@gmail.com', password: 'password1' };

// 函数：处理异常
function handleException(response, e) {
  const customErrorMessage = `Actual Response Body:\n ${JSON.stringify(response.body, null, 2)}\n \n ${e.message}`;
  throw new Error(customErrorMessage); // 重新抛出异常
}

const UserTest = async (server) => {
  let authToken;
  beforeEach(async () => {
    userData = { email: 'login@gmail.com', password: 'password1' };
  });

  async function registerRequest(userData) {
    return request(server)
      .post('/api/1.0/users/register')
      .send(userData);
  }

  async function loginRequest(userData) {
    return request(server)
      .post('/api/1.0/users/login')
      .send(userData);
  }
  async function getRequest(authToken) {
    const requestObject = request(server)
      .get('/api/1.0/user');
    if (authToken) {
      requestObject.set('Authorization', `Bearer ${authToken}`);
    }
    return requestObject;
  }

  async function patchRequest(requestBody, authToken) {
    const requestObject = request(server)
      .patch('/api/1.0/user')
      .send(requestBody);
    if (authToken) {
      requestObject.set('Authorization', `Bearer ${authToken}`);
    }
    return requestObject;
  }

  async function deleteRequest(authToken) {
    const requestObject = request(server)
      .delete('/api/1.0/user');
    if (authToken) {
      requestObject.set('Authorization', `Bearer ${authToken}`);
    }
    return requestObject;
  }

  describe('Post /users/register', () => {
    // console.log(userData);
    it('201: User signed up successfully.', async () => {
      let response;
      try {
        response = await registerRequest(userData);
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
          response = await registerRequest(123);
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
          response = await registerRequest(userData);

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
          response = await registerRequest(userData);

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
          const response = await registerRequest(newUserData);

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
          response = await registerRequest(userData);
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
        response = await registerRequest(userData);

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
        response = await loginRequest(userData);
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
          response = await loginRequest(123);
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
          response = await loginRequest(userData);

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
          response = await loginRequest(userData);

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
          response = await loginRequest(newUserData);

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
          response = await loginRequest(newUserData);

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
          response = await loginRequest(userData);

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
        response = await getRequest(authToken);
        expect(response.status).toBe(200);
      } catch (e) {
        handleException(response, e);
      }
    });
    describe('401: JWT problem', () => {
      it('Missing Field', async () => {
        let response;
        try {
          response = await getRequest();
          expect(response.status).toBe(401);
        } catch (e) {
          handleException(response, e);
        }
      });
      it('Undefined Field', async () => {
        let response;
        try {
          response = await getRequest(123);
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
        response = await patchRequest(requestBody, authToken);
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
          response = await patchRequest(requestBody, authToken);
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
          response = await patchRequest(123);
          expect(response.status).toBe(400);
        } catch (e) {
          handleException(response, e);
        }
      });
      it('Missing Field', async () => {
        const newUserData = {};
        let response;
        try {
          response = await patchRequest(newUserData, authToken);

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
          response = await patchRequest(userData, authToken);

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
          response = await patchRequest(requestBody);
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
          response = await patchRequest(requestBody, 123);
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
          response = await deleteRequest();
          expect(response.status).toBe(401);
        } catch (e) {
          handleException(response, e);
        }
      });
      it('delete with incorrect authToken', async () => {
        let response;
        try {
          response = await deleteRequest(123);
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
          response = await deleteRequest(authToken); // 在前面測試已經被刪掉，要再加authToken
          expect(response.status).toBe(200);
          response = await registerRequest(userData);
          authToken = response.body.token;
          expect(response.status).toBe(201);
        } catch (e) {
          handleException(response, e);
        }
      });
      it('delete success and login again fail', async () => {
        let response;
        try {
          response = await deleteRequest(authToken);
          expect(response.status).toBe(200);
          response = await loginRequest(userData);

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
