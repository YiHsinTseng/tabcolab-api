const request = require('supertest');
const server = require('../../../server');

async function postTab(groupId, newTabData, authToken) {
  const requestObject = request(server)
    .post(`/api/1.0/groups/${groupId}/tabs`)
    .set('Content-Type', 'application/json')
    .send(newTabData);
  if (authToken) {
    requestObject.set('Authorization', `Bearer ${authToken}`);
  }
  return requestObject;
}

async function postNote(groupId, newNoteData, authToken) {
  const requestObject = request(server)
    .post(`/api/1.0/groups/${groupId}/notes`)
    .set('Content-Type', 'application/json')
    .send(newNoteData);
  if (authToken) {
    requestObject.set('Authorization', `Bearer ${authToken}`);
  }
  return requestObject;
}

async function patchNote(groupId, itemId, patchNoteRequest, authToken) {
  const requestObject = request(server)
    .patch(`/api/1.0/groups/${groupId}/notes/${itemId}`)
    .set('Content-Type', 'application/json')
    .send(patchNoteRequest);
  if (authToken) {
    requestObject.set('Authorization', `Bearer ${authToken}`);
  }
  return requestObject;
}

async function patchTodo(groupId, itemId, patchTodoRequest, authToken) {
  const requestObject = request(server)
    .patch(`/api/1.0/groups/${groupId}/todos/${itemId}`)
    .set('Content-Type', 'application/json')
    .send(patchTodoRequest);
  if (authToken) {
    requestObject.set('Authorization', `Bearer ${authToken}`);
  }
  return requestObject;
}

module.exports = {
  postTab, postNote, patchNote, patchTodo,
};
