const request = require('supertest');
const { handleException } = require('../../utils/testErrorHandler');
const { groupsChanges } = require('../../utils/groupsChanges');

const ItemTest = async (server) => {
  let authToken;

  beforeAll(async () => {
    const userData = { email: 'user@example.com', password: 'mySecurePassword123' };
    const res = await request(server)
      .post('/api/1.0/users/login')
      .send(userData);
    authToken = res.body.token;
    // console.log(res.body);
  });

  const {
    postTab, postNote, patchNote, patchTodo,
  } = require('../apis/specItemAPI');

  let req;
  // let res;

  beforeEach(() => {
    req = { params: {}, body: {} };
  });

  // const testSharedScenarios = (action) => {
  //     test('returns 404 if request parameters are invalid', () => {
  //       action(req, res);
  //       expect(res.status).toHaveBeenCalledWith(404);
  //       expect(res.json).toHaveBeenCalledWith({ error: "Invalid request parameters" });
  //     });

  //     test('returns 500 if internal server error occurs', () => {
  //       jest.spyOn(Item, action.name).mockImplementation(() => { throw new Error("Internal server error") });
  //       try {
  //         action(req, res);
  //         expect(res.status).toHaveBeenCalledWith(500);
  //     } catch (error) {
  //         expect(error.message).toBe("Internal server error");
  //     }
  //     });
  //   };

  describe('Tab API Endpoints', () => {
    beforeEach(async () => {
      req.params.group_id = '1';
    });

    // Test case for addTab endpoint
    describe('POST /groups/:group_id/tabs', () => {
      let newTabData;
      beforeEach(() => {
        newTabData = {
          browserTab_favIconURL: 'http://example.com/favicon.ico',
          browserTab_title: 'Test Tab',
          browserTab_url: 'http://example.com',
          browserTab_id: 456,
          browserTab_index: 7,
          browserTab_active: false,
          browserTab_status: 'complete',
          windowId: 8438513405,
          targetItem_position: 0,
        };
      });

      test('addTab: should respond with 201 and return item_id when valid data is provided', async () => {
        const res = await postTab(req.params.group_id, newTabData, authToken);
        //   console.log(res.status,res.body)
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('message', 'New tab added to group successfully');
        expect(res.body).toHaveProperty('item_id');
      });

      test('addTab: should respond with 400 when invalid data is provided', async () => {
        //   const res =
        newTabData = {};
        const res = await postTab(req.params.group_id, newTabData, authToken);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', 'Invalid request body');
      });

      // Add more test cases as needed
    });

    //   // Test case for updateTab endpoint
    //   describe('PATCH /groups/:group_id/tabs/:item_id', () => {
    //     beforeEach(async () => {
    //       req.params.group_id = '1';
    //       req.params.item_id = '1';
    //     });

    //     test('updateTab: should respond with 201 and update note when valid data is provided', async () => {
    //       // Send a request to update an existing tab
    //       //   const res =

    //       const res = await request(server)
    //         .patch(`/groups/${req.params.group_id}/tabs/${req.params.item_id}`)
    //         .send({
    //           note_content: 'Updated note content',
    //           // note_bgColor: '#ffffff',
    //         });

    //       expect(res.status).toBe(201);
    //       expect(res.body).toHaveProperty('message', 'Note added to tab successfully');
    //       expect(res.body).toHaveProperty('note_content', 'Updated note content');
    //     });

    //     test('updateTab: should respond with 400 when invalid data is provided', async () => {
    //       //   const res =
    //       req.params.item_id = '2';
    //       const res = await request(server)
    //         .patch(`/groups/${req.params.group_id}/tabs/${req.params.item_id}`)
    //         .send({
    //           // Invalid data, missing required fields
    //         });

    //       expect(res.status).toBe(404);
    //       expect(res.body).toHaveProperty('error', 'Tab not found in group');
    //     });

    //     // Add more test cases as needed
    //   });

    //   // Add more test cases for other endpoints like addNote, updateNote, etc.
    // });

    describe('Note API Endpoints', () => {
      beforeEach(async () => {
        req.params.group_id = '1';
      });
      // Test case for addNote endpoint
      describe('Post /groups/:group_id/notes', () => {
        let newNoteData;

        beforeEach(() => {
          req.params.group_id = '1';
        });
        beforeEach(() => {
          newNoteData = {
            note_content: 'note',
            note_bgColor: '#ffffff',
          };
        });

        test('addNote: should add a note to group successfully', async () => {
          try {
            const res = await postNote(req.params.group_id, newNoteData, authToken);
            notice = res;
            expect(res.status).toBe(201);
            expect(typeof res.body.item_id).toBe('string');
            expect(res.body.message).toEqual('Note added to group successfully');
          } catch (e) {
            handleException(notice, e);
          }
        });

        test('addNote: should return error for invalid request body', async () => {
        // const invalidReq = { ...req, body: {} };
          let notice;

          try {
            newNoteData = {};
            const res = await postNote(req.params.group_id, newNoteData, authToken);
            notice = res;
            expect(res.status).toBe(400);
            expect(res.body.message).toEqual('Invalid request body');
          } catch (e) {
            handleException(notice, e);
          }
        });
      });
      // NOTE - 無效操作要放在前面
      describe('Patch /groups/:group_id/notes/:item_id', () => {
        let patchNoteRequest;
        beforeEach(async () => {
          req.params.group_id = '1';
          req.params.item_id = '2';
        });

        test('updateNote: should return error for invalid request body', async () => {
          patchNoteRequest = {};
          let notice;
          try {
            const res = await patchNote(req.params.group_id, req.params.item_id, patchNoteRequest, authToken);
            notice = res;
            expect(res.status).toBe(400);
            expect(res.body.message).toEqual('Invalid request body');
          } catch (e) {
            handleException(notice, e);
          }
        });

        test('updateNote: should change note to todo successfully', async () => {
          patchNoteRequest = {
            item_type: 2, // Assuming 1 represents a note
          };
          let notice;
          try {
            const res = await patchNote(req.params.group_id, req.params.item_id, patchNoteRequest, authToken);
            notice = res;
            expect(res.status).toBe(200);
            expect(res.body.message).toEqual('Note changed to todo successfully');
          } catch (e) {
            handleException(notice, e);
          }
        });
      });
    });
    describe('Todo API Endpoints', () => {
      let patchTodoRequest;
      describe('Patch /groups/:group_id/todos/:item_id', () => {
        beforeEach(async () => {
          req.params.group_id = '1';
          req.params.item_id = '3';
        });

        test('updateTodo: should respond with status 404 if group is not found', async () => {
          let notice;
          try {
            req.params.group_id = '9';
            patchTodoRequest = { item_type: 1 };
            const res = await patchTodo(req.params.group_id, req.params.item_id, patchTodoRequest, authToken);
            notice = res;
            expect(res.status).toBe(404);
            expect(res.body.message).toEqual('Group not found');
          } catch (e) {
            handleException(notice, e);
          }
        });

        test('updateTodo: should respond with status 404 if todo is not found in group', async () => {
          req.params.item_id = '100';
          patchTodoRequest = { item_type: 1 };
          let notice;
          try {
            const res = await patchTodo(req.params.group_id, req.params.item_id, patchTodoRequest, authToken);
            notice = res;
            expect(res.status).toBe(404);
            expect(res.body.message).toEqual('Todo not found in group');
          } catch (e) {
            handleException(notice, e);
          }
        });

        test('updateTodo: should respond with status 400 if request body is invalid', async () => {
          patchTodoRequest = { };
          let notice;
          try {
            const res = await patchTodo(req.params.group_id, req.params.item_id, patchTodoRequest, authToken);
            notice = res;
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid request body' });
          } catch (e) {
            handleException(notice, e);
          }
        });

        test('updateTodo(ChangetoNote): should change todo to note successfully', async () => {
          patchTodoRequest = { item_type: 1 };
          const res = await patchTodo(req.params.group_id, req.params.item_id, patchTodoRequest, authToken);

          expect(res.status).toBe(200);
          expect(res.body.message).toEqual(
            'Todo changed to Note successfully',
          );
        });

        test('updateTodo(StatusUpdate): should update todo status successfully', async () => {
          req.params.group_id = '1';
          req.params.item_id = '2';
          patchTodoRequest = { doneStatus: true };
          const res = await patchTodo(req.params.group_id, req.params.item_id, patchTodoRequest, authToken);

          expect(res.status).toBe(200);
          expect(res.body.message).toEqual('Todo status updated successfully');
        });

        test('updateTodo(StatusUpdate): should update todo status agian successfully', async () => {
          req.params.group_id = '1';
          req.params.item_id = '2';
          patchTodoRequest = { doneStatus: false };
          const res = await patchTodo(req.params.group_id, req.params.item_id, patchTodoRequest, authToken);

          expect(res.status).toBe(200);
          expect(res.body.message).toEqual('Todo status updated successfully');
        });
      });
    });
  });
};

module.exports = ItemTest;
