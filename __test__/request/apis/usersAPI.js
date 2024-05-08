const request = require('supertest');
const server = require('../../../server');

async function registerUser(userData) {
  return request(server)
    .post('/api/1.0/users/register')
    .send(userData);
}

async function loginUser(userData) {
  return request(server)
    .post('/api/1.0/users/login')
    .send(userData);
}
async function getUser(authToken) {
  const requestObject = request(server)
    .get('/api/1.0/user');
  if (authToken) {
    requestObject.set('Authorization', `Bearer ${authToken}`);
  }
  return requestObject;
}

async function patchUser(requestBody, authToken) {
  const requestObject = request(server)
    .patch('/api/1.0/user')
    .send(requestBody);
  if (authToken) {
    requestObject.set('Authorization', `Bearer ${authToken}`);
  }
  return requestObject;
}

async function deleteUser(authToken) {
  const requestObject = request(server)
    .delete('/api/1.0/user');
  if (authToken) {
    requestObject.set('Authorization', `Bearer ${authToken}`);
  }
  return requestObject;
}

module.exports = {
  registerUser, loginUser, getUser, patchUser, deleteUser,
};
