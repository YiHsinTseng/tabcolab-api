const request = require('supertest');
const server = require('../../../server');

async function postTab(groupId, newTabData, authToken) {
  const requestObject = request(server)
    .post(`/api/1.0/groups/${groupId}/tabs`)
    .send(newTabData);
  if (authToken) {
    requestObject.set('Authorization', `Bearer ${authToken}`);
  }
  return requestObject;
}

async function postNote(groupId, newNoteData, authToken) {
  const requestObject = request(server)
    .post(`/api/1.0/groups/${groupId}/notes`)
    .send(newNoteData);
  if (authToken) {
    requestObject.set('Authorization', `Bearer ${authToken}`);
  }
  return requestObject;
}

async function patchNote(groupId, itemId, patchNoteRequest, authToken) {
  const requestObject = request(server)
    .patch(`/api/1.0/groups/${groupId}/notes/${itemId}`)
    .send(patchNoteRequest);
  if (authToken) {
    requestObject.set('Authorization', `Bearer ${authToken}`);
  }
  return requestObject;
}

async function patchTodo(groupId, itemId, patchTodoRequest, authToken) {
  const requestObject = request(server)
    .patch(`/api/1.0/groups/${groupId}/todos/${itemId}`)
    .send(patchTodoRequest);
  if (authToken) {
    requestObject.set('Authorization', `Bearer ${authToken}`);
  }
  return requestObject;
}

module.exports = {
  postTab, postNote, patchNote, patchTodo,
};
