const { assert } = require('joi');
const request = require('supertest');

let userData = { email: 'login@gmail.com', password: 'password1' };

const UserTest = async (server) => {
  let authToken;
  beforeEach(async () => {
    userData = { email: 'login@gmail.com', password: 'password1' };
  });

  describe('Post /users/register', () => {
    // console.log(userData);
    it('201: User signed up successfully.', async () => {
      const response = await request(server)
        .post('/api/1.0/users/register')
        .send(userData);
      expect(response.status).toBe(201);
      authToken = response.body.token;
      expect(response.body.message).toBe('User signed up successfully.');
      // console.log(response.body);
    });
    describe('400 Bad request: Body Format Error', () => {
      it('Request Format Error', async () => {
        const response = await request(server)
          .post('/api/1.0/users/register')
          .send(123);// 不好測
        // console.log(response.body);
        console.log(response.body, 'Request Format Error');
        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBe('Unexpected end of JSON input');
      });
      it('email field', async () => {
        userData.email = 123;
        const response = await request(server)
          .post('/api/1.0/users/register')
          .send(userData);
        // console.log(response.body);
        console.log(response.body);
        expect(response.status).toBe(400);
        expect(response.body.status).toMatch('fail');
        expect(response.body.message).toMatch('must be');
      });
      it('password field', async () => {
        userData.password = 123;
        const response = await request(server)
          .post('/api/1.0/users/register')
          .send(userData);
        // console.log(response.body);
        console.log(response.body);
        expect(response.status).toBe(400);
        expect(response.body.status).toMatch('fail');
        expect(response.body.message).toMatch('must be');
      });
    });
    describe('400 Bad request: Field Error', () => {
      it('Missing Field', async () => {
        const { password, ...newUserData } = userData;
        const response = await request(server)
          .post('/api/1.0/users/register')
          .send(newUserData);
        console.log(response.body);
        expect(response.status).toBe(400);
        expect(response.body.status).toMatch('fail');
        expect(response.body.message).toMatch('is required.');
      });
      it('Undefined Field', async () => {
        userData.username = 'user';
        const response = await request(server)
          .post('/api/1.0/users/register')
          .send(userData);
        console.log(response.body);
        expect(response.status).toBe(400);
        expect(response.body.status).toMatch('fail');
        expect(response.body.message).toBe('This email has already been registered');
      });
    });
    it('409: Email has been registered.', async () => {
      const response = await request(server)
        .post('/api/1.0/users/register')
        .send(userData);
      console.log(response.body);
      expect(response.status).toBe(409);
      expect(response.body.status).toMatch('fail');
      expect(response.body.message).toBe('This email has already been registered');
    });
  });

  describe('Post /users/login', () => {
    it('get success', async () => {
      const response = await request(server)
        .post('/api/1.0/users/login')
        .send(userData);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User signed in successfully');
      expect(response.body.token).toBe('User signed in successfully');
      authToken = response.body.token;
    });
  });

  describe('Patch /user', () => {
    it('Change Password success', async () => {
      const requestBody = { password: 'password' };
      requestBody.password = 'password1';
      const response = await request(server)
        .patch('/api/1.0/user')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestBody);
      expect(response.status).toBe(200);
      // console.log(response.body);
    });
    it('Change Password length short fail', async () => {
      const requestBody = { password: 'password' };
      requestBody.password = 'p';
      // console.log(requestBody);
      const response = await request(server)
        .patch('/api/1.0/user')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestBody);
      expect(response.status).toBe(400);
      // console.log(response.body);
    });
  });
  describe('Delete /user', () => {
    it('delete success', async () => {
      const response = await request(server)
        .delete('/api/1.0/user')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(200);
    });
    it('get success', async () => {
      console.log(userData);// 被變數污染了
      const response = await request(server)
        .post('/api/1.0/users/login')
        .send(userData);
      // console.log(response.body);
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('User not found or invalid email'); // 要跟API文件一樣還是跟程式邏輯一樣就好？
    });
  });
};

module.exports = UserTest;
