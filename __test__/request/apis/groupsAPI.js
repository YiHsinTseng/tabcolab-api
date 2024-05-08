const request = require('supertest');
const server = require('../../../server');

async function getGroup(authToken) {
  const requestObject = request(server)
    .get('/api/1.0/groups');
  if (authToken) {
    requestObject.set('Authorization', `Bearer ${authToken}`);
  }
  return requestObject;
}
async function postGroup(newGroupData, authToken) {
  const requestObject = request(server)
    .post('/api/1.0/groups')
    .send(newGroupData);
  if (authToken) {
    requestObject.set('Authorization', `Bearer ${authToken}`);
  }
  return requestObject;
}

async function patchGroup(groupId, patchGroupRequest, authToken) {
  const requestObject = request(server)
    .patch(`/api/1.0/groups/${groupId}`)
    .send(patchGroupRequest);
  if (authToken) {
    requestObject.set('Authorization', `Bearer ${authToken}`);
  }
  return requestObject;
}

async function deleteGroup(groupId, authToken) {
  const requestObject = request(server)
    .delete(`/api/1.0/groups/${groupId}`);
  if (authToken) {
    requestObject.set('Authorization', `Bearer ${authToken}`);
  }
  return requestObject;
}

module.exports = {
  getGroup, postGroup, patchGroup, deleteGroup,
};
