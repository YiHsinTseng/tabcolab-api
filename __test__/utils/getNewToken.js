const request = require('supertest');
const server = require('../../server');

const getNewToken = async (userData) => {
  const response = await request(server)
    .post('/api/1.0/users/login')
    .set('Content-Type', 'application/json')
    .send(userData);
  return response.body.token;
};

module.exports = { getNewToken };
