const request = require('supertest');

const ItemTest = async (server) => {
  let authToken;
  beforeAll(async () => {
    const userData = { email: 'user@gmail.com', password: 'password1' };
    const response = await request(server)
      .post('/api/1.0/users/login')
      .send(userData);
    authToken = response.body.token;
  });

  describe('POST /item', () => {
    it('post success', async () => {
      // console.log(authToken);
    });
  });
};

module.exports = ItemTest;
