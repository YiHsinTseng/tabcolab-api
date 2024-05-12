const request = require('supertest');
const { handleException } = require('../../utils/testErrorHandler');
const { groupsChanges, ArraysChanges } = require('../../utils/groupsChanges');
const { getGroup } = require('./GroupTest');
const { extractFieldType } = require('../../utils/extractFieldType');
const { testValues, getTestValueByType } = require('../../utils/FieldDataTypeTest');

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

  let req = { params: {}, body: {} };
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
      let newTabData = {
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
      describe('401: JWT problem', () => {
        test('Missing JWT', async () => {
          let res;
          try {
            res = await postTab(req.params.group_id, newTabData);
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Missing JWT');
          } catch (e) {
            handleException(res, e);
          }
        });
        test('Invaild JWT', async () => {
          let res;
          try {
            res = await postTab(req.params.group_id, req.params.group_id, newTabData, 123);
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid JWT');
          } catch (e) {
            handleException(res, e);
          }
        });
      });
      describe('400 Bad request: Body Format Error', () => { // 不好測
        it('JSON Format Error', async () => {
          // try {
          let res;
          try {
            res = await postTab(req.params.group_id, 123, authToken);
            // console.log(res.body, 'Request Format Error');
            expect(res.status).toBe(400);
          } catch (e) {
            handleException(res, e);
          }
          // } catch (e) {
          //   console.log(e.message);
          // }

          // expect(res.status).toBe(400);
          // expect(res.body.status).toBe('fail');
          // expect(res.body.message).toBe('Unexpected end of JSON input');
        });
        it('No field', async () => {
          newTabData = {};
          let res;
          try {
            res = await postTab(req.params.group_id, newTabData, authToken);

            expect(res.status).toBe(400);
            expect(res.body.status).toMatch('fail');
            expect(res.body.message).toMatch('is required');
          } catch (e) {
            handleException(res, e);
          }
        });
        describe('Missing field', () => {
          const testData = Object.keys(newTabData);
          // console.log(newGroupTabData);
          testData.forEach((field) => {
            it(`Missing ${field} field`, async () => {
              let res;
              // console.log(newGroupTabData);
              try {
                const { [field]: removedField, ...testTabData } = newTabData;
                res = await postTab(req.params.group_id, testTabData, authToken);

                expect(res.status).toBe(400);
                expect(res.body.status).toMatch('fail');
                expect(res.body.message).toMatch(`"${field}" is required`);
              } catch (e) {
                handleException(res, e);
              }
            });
          });
        });
        it('Undefined Field', async () => {
          newTabData.username = 'user';
          let res;
          try {
            res = await postTab(req.params.group_id, newTabData, authToken);

            expect(res.status).toBe(400);
            expect(res.body.status).toMatch('fail');
            expect(res.body.message).toMatch('not allowed');
          } catch (e) {
            handleException(res, e);
          }
        });
      });
      const typeChecks = extractFieldType(newTabData);
      // Helper function to get test value based on type

      describe('400 Bad request: Field Data Format Error', () => {
        Object.entries(typeChecks).forEach(([type, fields]) => {
          fields.forEach((field) => {
            const testData = { ...newTabData };

            // Generate test request data with specified type for the field
            Object.entries(getTestValueByType(type)).forEach(([writetype, writedvalue]) => {
              if (writetype !== type) {
                testData[field] = writedvalue;

                it(`${field} field required ${type} but ${writetype}`, async () => {
                  let res;
                  // console.log(testData);
                  try {
                    res = await postTab(req.params.group_id, testData, authToken);
                    expect(res.status).toBe(400);
                    expect(res.body.status).toMatch('fail');
                    expect(res.body.message).toMatch(`"${field}" must be a ${type}`);
                    // console.log(`${field} field required ${type} but ${writetype}`);
                    // console.log(res.body);
                  } catch (e) {
                    handleException(res, e);
                  }
                });
              }
            });
          });
        });
      });
      test('addTab: should respond with 201 and return item_id when valid data is provided', async () => {
        const res = await postTab(req.params.group_id, newTabData, authToken);
        //   console.log(res.status,res.body)
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('message', 'New tab added to group successfully');
        expect(res.body).toHaveProperty('item_id');
      });

      test('addTab: should respond with 404 when invalid group_id', async () => {
        req.params.group_id = '100';
        const res = await postTab(req.params.group_id, newTabData, authToken);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Group not found or invalid group ID');
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
        let newNoteData = {
          note_content: 'note',
          note_bgColor: '#ffffff',
        };

        beforeEach(() => {
          req.params.group_id = '1';
        });
        beforeEach(() => {
          newNoteData = {
            note_content: 'note',
            note_bgColor: '#ffffff',
          };
        });

        describe('401: JWT problem', () => {
          test('Missing JWT', async () => {
            let res;
            try {
              res = await postNote(req.params.group_id, newNoteData);
              expect(res.status).toBe(401);
              expect(res.body.message).toBe('Missing JWT');
            } catch (e) {
              handleException(res, e);
            }
          });
          test('Invaild JWT', async () => {
            let res;
            try {
              res = await postNote(req.params.group_id, newNoteData, 123);
              expect(res.status).toBe(401);
              expect(res.body.message).toBe('Invalid JWT');
            } catch (e) {
              handleException(res, e);
            }
          });
        });

        test('postNote: should respond with status 404 if group is not found', async () => {
          let notice;
          try {
            req.params.group_id = '9';
            const res = await postNote(req.params.group_id, newNoteData, authToken);
            notice = res;
            expect(res.status).toBe(404);
            expect(res.body.message).toEqual('Group not found');
          } catch (e) {
            handleException(notice, e);
          }
        });
        const typeChecks = extractFieldType(newNoteData);
        // Helper function to get test value based on type

        describe('400 Bad request: Field Data Format Error', () => {
          Object.entries(typeChecks).forEach(([type, fields]) => {
            fields.forEach((field) => {
              const testData = { ...newNoteData };

              // Generate test request data with specified type for the field
              Object.entries(getTestValueByType(type)).forEach(([writetype, writedvalue]) => {
                if (writetype !== type) {
                  testData[field] = writedvalue;

                  it(`${field} field required ${type} but ${writetype}`, async () => {
                    let res;
                    // console.log(testData);
                    try {
                      res = await postNote(req.params.group_id, testData, authToken);
                      expect(res.status).toBe(400);
                      expect(res.body.status).toMatch('fail');
                      expect(res.body.message).toMatch(`"${field}" must be a ${type}`);
                      // console.log(`${field} field required ${type} but ${writetype}`);
                      // console.log(res.body);
                    } catch (e) {
                      handleException(res, e);
                    }
                  });
                }
              });
            });
          });
        });
        test('addNote: should add a note to group successfully', async () => {
          let notice;
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

        describe('400 Bad request: Body Format Error', () => { // 不好測
          it('JSON Format Error', async () => {
            // try {
            let res;
            try {
              res = await postNote(req.params.group_id, 123, authToken);
              // console.log(res.body, 'Request Format Error');
              expect(res.status).toBe(400);
            } catch (e) {
              handleException(res, e);
            }
            // } catch (e) {
            //   console.log(e.message);
            // }

            // expect(res.status).toBe(400);
            // expect(res.body.status).toBe('fail');
            // expect(res.body.message).toBe('Unexpected end of JSON input');
          });
          it('No field', async () => {
            newNoteData = {};
            let res;
            try {
              res = await postNote(req.params.group_id, newNoteData, authToken);

              expect(res.status).toBe(400);
              expect(res.body.status).toMatch('fail');
              expect(res.body.message).toMatch('is required');
            } catch (e) {
              handleException(res, e);
            }
          });
          describe('Missing field', () => {
            const testData = Object.keys(newNoteData);
            // console.log(newGroupTabData);
            testData.forEach((field) => {
              it(`Missing ${field} field`, async () => {
                let res;
                // console.log(newGroupTabData);
                try {
                  const { [field]: removedField, ...testNoteData } = newNoteData;
                  res = await postNote(testNoteData, authToken);

                  expect(res.status).toBe(400);
                  expect(res.body.status).toMatch('fail');
                  expect(res.body.message).toMatch(`"${field}" is required`);
                } catch (e) {
                  handleException(res, e);
                }
              });
            });
          });
          it('Undefined Field', async () => {
            newNoteData.username = 'user';
            let res;
            try {
              res = await postNote(req.params.group_id, newNoteData, authToken);

              expect(res.status).toBe(400);
              expect(res.body.status).toMatch('fail');
              expect(res.body.message).toMatch('not allowed');
            } catch (e) {
              handleException(res, e);
            }
          });
        });
      });
      // NOTE - 無效操作要放在前面
      describe('Patch /groups/:group_id/notes/:item_id', () => {
        let patchNoteRequest;
        beforeEach(async () => {
          req.params.group_id = '1';
          req.params.item_id = '2';
        });
        describe('404', () => {
          test('updateNote: should respond with status 404 if group is not found', async () => {
            let notice;
            try {
              req.params.group_id = '9';
              patchNoteRequest = { item_type: 1 };
              const res = await patchNote(req.params.group_id, req.params.item_id, patchNoteRequest, authToken);
              notice = res;
              expect(res.status).toBe(404);
              expect(res.body.message).toEqual('Group not found');
            } catch (e) {
              handleException(notice, e);
            }
          });
          test('updateNote: should respond with status 404 if todo is not found in group', async () => {
            req.params.item_id = '100';
            patchNoteRequest = { note_content: '404' };
            let notice;
            try {
              const res = await patchNote(req.params.group_id, req.params.item_id, patchNoteRequest, authToken);
              notice = res;
              expect(res.status).toBe(404);
              expect(res.body.message).toEqual('Note not found in group');
            } catch (e) {
              handleException(notice, e);
            }
          });
        });
        describe('PATCH Note Content', () => {
          patchNoteRequest = {
            note_content: 'changed_note_content', // Assuming 1 represents a note
          };
          beforeEach(async () => {
            patchNoteRequest = {
              note_content: 'changed_note_content', // Assuming 1 represents a note
            };
          });

          const typeChecks = extractFieldType(patchNoteRequest);
          // Helper function to get test value based on type

          describe('400 Bad request: Field Data Format Error', () => {
            Object.entries(typeChecks).forEach(([type, fields]) => {
              fields.forEach((field) => {
                const testData = { ...patchNoteRequest };

                // Generate test request data with specified type for the field
                Object.entries(getTestValueByType(type)).forEach(([writetype, writedvalue]) => {
                  if (writetype !== type) {
                    testData[field] = writedvalue;

                    it(`${field} field required ${type} but ${writetype}`, async () => {
                      let res;
                      // console.log(testData);
                      try {
                        res = await patchNote(req.params.group_id, req.params.item_id, testData, authToken);
                        expect(res.status).toBe(400);
                        expect(res.body.status).toMatch('fail');
                        expect(res.body.message).toMatch(`"${field}" must be a ${type}`);
                        // console.log(`${field} field required ${type} but ${writetype}`);
                        // console.log(res.body);
                      } catch (e) {
                        handleException(res, e);
                      }
                    });
                  }
                });
              });
            });
          });
          test('updateNote: should change note content successfully', async () => {
            let notice;
            try {
              const res = await patchNote(req.params.group_id, req.params.item_id, patchNoteRequest, authToken);
              notice = res;
              expect(res.status).toBe(200);
              expect(res.body.message).toEqual('Note content changed successfully');
            } catch (e) {
              handleException(notice, e);
            }
          });
        });
        describe('PATCH Item Type to Todo', () => {
          patchNoteRequest = {
            item_type: 2, // Assuming 1 represents a note
          };

          beforeEach(async () => {
            patchNoteRequest = {
              item_type: 2, // Assuming 1 represents a note
            };
          });
          describe('400 Bad request: Field Data Format Error', () => {
            const typeChecks = extractFieldType(patchNoteRequest);

            Object.entries(typeChecks).forEach(([type, fields]) => {
              fields.forEach((field) => {
                const testData = { ...patchNoteRequest };

                // Generate test request data with specified type for the field
                Object.entries(getTestValueByType(type)).forEach(([writetype, writedvalue]) => {
                  if (writetype !== type) {
                    testData[field] = writedvalue;

                    it(`${field} field required ${type} but ${writetype}`, async () => {
                      let res;
                      // console.log(testData);
                      try {
                        res = await patchNote(req.params.group_id, req.params.item_id, testData, authToken);
                        expect(res.status).toBe(400);
                        expect(res.body.status).toMatch('fail');
                        expect(res.body.message).toMatch(`"${field}" must be a ${type}`);
                        // console.log(`${field} field required ${type} but ${writetype}`);
                        // console.log(res.body);
                      } catch (e) {
                        handleException(res, e);
                      }
                    });
                  }
                });
              });
            });
          });
          test('updateNote: should change note to todo successfully', async () => {
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
        describe('400 Bad request: Body Format Error', () => { // 不好測
          it('JSON Format Error', async () => {
            // try {
            let res;
            try {
              res = await patchNote(req.params.group_id, req.params.item_id, 123, authToken);
              // console.log(res.body, 'Request Format Error');
              expect(res.status).toBe(400);
            } catch (e) {
              handleException(res, e);
            }
            // } catch (e) {
            //   console.log(e.message);
            // }

            // expect(res.status).toBe(400);
            // expect(res.body.status).toBe('fail');
            // expect(res.body.message).toBe('Unexpected end of JSON input');
          });
          it('No field', async () => {
            patchNoteRequest = {};
            let res;
            try {
              res = await patchNote(req.params.group_id, req.params.item_id, patchNoteRequest, authToken);

              expect(res.status).toBe(400);
              expect(res.body.status).toMatch('fail');
              expect(res.body.message).toMatch('is required');
            } catch (e) {
              handleException(res, e);
            }
          });

          it('Undefined Field', async () => {
            patchNoteRequest.username = 'user';
            let res;
            try {
              res = await patchNote(req.params.group_id, req.params.item_id, patchNoteRequest, authToken);

              expect(res.status).toBe(400);
              expect(res.body.status).toMatch('fail');
              expect(res.body.message).toMatch('not allowed');
            } catch (e) {
              handleException(res, e);
            }
          });
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

        describe('401: JWT problem', () => {
          test('Missing JWT', async () => {
            let res;
            try {
              res = await patchTodo(req.params.group_id, req.params.item_id, patchTodoRequest);
              expect(res.status).toBe(401);
              expect(res.body.message).toBe('Missing JWT');
            } catch (e) {
              handleException(res, e);
            }
          });
          test('Invaild JWT', async () => {
            let res;
            try {
              res = await patchTodo(req.params.group_id, req.params.item_id, patchTodoRequest, 123);
              expect(res.status).toBe(401);
              expect(res.body.message).toBe('Invalid JWT');
            } catch (e) {
              handleException(res, e);
            }
          });
        });
        describe('404', () => {
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
        });
        describe('PATCH Done status', () => {
          req.params.group_id = '1';
          req.params.item_id = '2';
          patchTodoRequest = { doneStatus: true };

          beforeEach(async () => {
            req.params.group_id = '1';
            req.params.item_id = '2';
            patchTodoRequest = { doneStatus: true };
          });

          const typeChecks = extractFieldType(patchTodoRequest);
          // Helper function to get test value based on type

          describe('400 Bad request: Field Data Format Error', () => {
            Object.entries(typeChecks).forEach(([type, fields]) => {
              fields.forEach((field) => {
                const testData = { ...patchTodoRequest };

                // Generate test request data with specified type for the field
                Object.entries(getTestValueByType(type)).forEach(([writetype, writedvalue]) => {
                  if (writetype !== type) {
                    testData[field] = writedvalue;

                    it(`${field} field required ${type} but ${writetype}`, async () => {
                      let res;
                      // console.log(testData);
                      try {
                        res = await patchTodo(req.params.group_id, req.params.item_id, testData, authToken);
                        expect(res.status).toBe(400);
                        expect(res.body.status).toMatch('fail');
                        expect(res.body.message).toMatch(`"${field}" must be a ${type}`);
                        // console.log(`${field} field required ${type} but ${writetype}`);
                        // console.log(res.body);
                      } catch (e) {
                        handleException(res, e);
                      }
                    });
                  }
                });
              });
            });
          });
          test('updateTodo(StatusUpdate): should update todo status successfully', async () => {
            const res = await patchTodo(req.params.group_id, req.params.item_id, patchTodoRequest, authToken);

            expect(res.status).toBe(200);
            expect(res.body.message).toEqual('Todo status updated successfully');
          });
        });
        describe('PATCH Item Type to Note', () => {
          patchTodoRequest = { item_type: 1 };
          beforeEach(async () => {
            patchTodoRequest = { item_type: 1 };
          });
          const typeChecks = extractFieldType(patchTodoRequest);
          // Helper function to get test value based on type

          describe('400 Bad request: Field Data Format Error', () => {
            Object.entries(typeChecks).forEach(([type, fields]) => {
              fields.forEach((field) => {
                const testData = { ...patchTodoRequest };

                // Generate test request data with specified type for the field
                Object.entries(getTestValueByType(type)).forEach(([writetype, writedvalue]) => {
                  if (writetype !== type) {
                    testData[field] = writedvalue;

                    it(`${field} field required ${type} but ${writetype}`, async () => {
                      let res;
                      // console.log(testData);
                      try {
                        res = await patchTodo(req.params.group_id, req.params.item_id, testData, authToken);
                        expect(res.status).toBe(400);
                        expect(res.body.status).toMatch('fail');
                        expect(res.body.message).toMatch(`"${field}" must be a ${type}`);
                        // console.log(`${field} field required ${type} but ${writetype}`);
                        // console.log(res.body);
                      } catch (e) {
                        handleException(res, e);
                      }
                    });
                  }
                });
              });
            });
          });
          test('updateTodo(ChangetoNote): should change todo to note successfully', async () => {
            const res = await patchTodo(req.params.group_id, req.params.item_id, patchTodoRequest, authToken);

            expect(res.status).toBe(200);
            expect(res.body.message).toEqual(
              'Todo changed to Note successfully',
            );
          });
          test('updateTodo(ChangetoNote): should update todo status agian successfully', async () => {
            req.params.group_id = '1';
            req.params.item_id = '2';
            patchTodoRequest = { doneStatus: false };
            const res = await patchTodo(req.params.group_id, req.params.item_id, patchTodoRequest, authToken);

            expect(res.status).toBe(200);
            expect(res.body.message).toEqual('Todo status updated successfully');
          });
        });
        describe('PATCH Note Content', () => {
          req.params.group_id = '1';
          req.params.item_id = '2';
          patchTodoRequest = { note_content: 'changed_note_content' };
          beforeEach(async () => {
            req.params.group_id = '1';
            req.params.item_id = '2';
            patchTodoRequest = { note_content: 'changed_note_content' };
          });
          const typeChecks = extractFieldType(patchTodoRequest);
          // Helper function to get test value based on type

          describe('400 Bad request: Field Data Format Error', () => {
            Object.entries(typeChecks).forEach(([type, fields]) => {
              fields.forEach((field) => {
                const testData = { ...patchTodoRequest };

                // Generate test request data with specified type for the field
                Object.entries(getTestValueByType(type)).forEach(([writetype, writedvalue]) => {
                  if (writetype !== type) {
                    testData[field] = writedvalue;

                    it(`${field} field required ${type} but ${writetype}`, async () => {
                      let res;
                      // console.log(testData);
                      try {
                        res = await patchTodo(req.params.group_id, req.params.item_id, testData, authToken);
                        expect(res.status).toBe(400);
                        expect(res.body.status).toMatch('fail');
                        expect(res.body.message).toMatch(`"${field}" must be a ${type}`);
                        // console.log(`${field} field required ${type} but ${writetype}`);
                        // console.log(res.body);
                      } catch (e) {
                        handleException(res, e);
                      }
                    });
                  }
                });
              });
            });
          });
          test('updateTodo(ChangeContent): should update note content successfully', async () => {
            const res = await patchTodo(req.params.group_id, req.params.item_id, patchTodoRequest, authToken);
            expect(res.status).toBe(200);
            expect(res.body.message).toEqual('Todo content changed successfully');
          });
        });
        describe('400 Bad request: Body Format Error', () => { // 不好測
          it('JSON Format Error', async () => {
            // try {
            let res;
            try {
              res = await patchTodo(req.params.group_id, req.params.item_id, 123, authToken);
              // console.log(res.body, 'Request Format Error');
              expect(res.status).toBe(400);
            } catch (e) {
              handleException(res, e);
            }
            // } catch (e) {
            //   console.log(e.message);
            // }

            // expect(res.status).toBe(400);
            // expect(res.body.status).toBe('fail');
            // expect(res.body.message).toBe('Unexpected end of JSON input');
          });
          it('No field', async () => {
            patchTodoRequest = {};
            let res;
            try {
              res = await patchTodo(req.params.group_id, req.params.item_id, patchTodoRequest, authToken);

              expect(res.status).toBe(400);
              expect(res.body.status).toMatch('fail');
              expect(res.body.message).toMatch('is required');
            } catch (e) {
              handleException(res, e);
            }
          });

          it('Undefined Field', async () => {
            patchTodoRequest.username = 'user';
            let res;
            try {
              res = await patchTodo(req.params.group_id, req.params.item_id, patchTodoRequest, authToken);

              expect(res.status).toBe(400);
              expect(res.body.status).toMatch('fail');
              expect(res.body.message).toMatch('not allowed');
            } catch (e) {
              handleException(res, e);
            }
          });
        });
        // test('updateTodo: should respond with status 400 if request body is invalid', async () => {
        //   patchTodoRequest = { };
        //   let notice;
        //   try {
        //     const res = await patchTodo(req.params.group_id, req.params.item_id, patchTodoRequest, authToken);
        //     notice = res;
        //     expect(res.status).toBe(400);
        //     expect(res.body).toEqual({ error: 'Invalid request body' });
        //   } catch (e) {
        //     handleException(notice, e);
        //   }
        // });
      });
    });
  });
};

module.exports = ItemTest;
