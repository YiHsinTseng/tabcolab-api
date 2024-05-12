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

  let req = { params: {}, body: {} };

  beforeEach(() => {
    req = { params: {}, body: {} };
  });

  const {
    getSearchItems, patchItem, deleteItem,
  } = require('../apis/itemsAPI');

  describe('Get /items/search', () => {
    beforeEach(() => {
      req.params.keywords = ' ';
    });
    describe('401: JWT problem', () => {
      test('Missing JWT', async () => {
        let res;
        try {
          res = await getSearchItems(req.params.keywords);
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('Missing JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
      test('Invaild JWT', async () => {
        let res;
        try {
          res = await getSearchItems(req.params.keywords, 123);
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('Invalid JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
    });

    describe('no blank', () => {
      describe('no keyword', () => {
        test('empty keyword para', async () => {
          req.params.keywords = '';
          let notice;
          try {
            const res = await getSearchItems(req.params.keywords, authToken);
            notice = res;
            throw new Error('Incompelte !!!');
          } catch (e) {
            handleException(notice, e);
          }
        });
      });
      describe('one keyword', () => {
        test('onekeyword within a group', async () => {
          req.params.keywords = 'Tab';
          let notice;

          try {
            // 并行获取旧的和新的组数据
            let res;
            let oldResult;

            [oldResult, res] = await Promise.all([
              getSearchItems('tab', authToken),
              getSearchItems(req.params.keywords, authToken),
            ]);

            notice = res;
            const result = ArraysChanges(oldResult.body, res.body);
            notice = result;

            expect(result.addedItems).toEqual([]);
            expect(result.deletedItems).toEqual([]);
          } catch (e) {
            handleException(notice, e);
          }
        });
        test('onekeyword in different groups', async () => {
          req.params.keywords = 'tab';
          let notice;
          try {
            // 并行获取旧的和新的组数据
            let res;
            let oldResult;

            [oldResult, res] = await Promise.all([
              getSearchItems(' ', authToken),
              getSearchItems(req.params.keywords, authToken),
            ]);

            notice = res;
            const result = ArraysChanges(oldResult.body, res.body);
            notice = result;
            expect(result.addedItems).toEqual([]);
            expect(result.deletedItems).toEqual([]);
            throw new Error('Incomplete !!!');
          } catch (e) {
            handleException(notice, e);
          }
        });
        test('onekeyword not in groups', async () => {
          req.params.keywords = 'xxxxxx';
          let notice;
          try {
            const res = await getSearchItems(req.params.keywords, authToken);
            notice = res;
            expect(res.body).toEqual([]);
            // throw new Error('Incompelte !!!');
          } catch (e) {
            handleException(notice, e);
          }
        });
      });
    });
    describe('single blank', () => {
      describe('no keyword', () => {
        test('no keyword return All', async () => {
          req.params.keywords = ' ';
          let notice;
          try {
            // 并行获取旧的和新的组数据
            let res;
            let oldResult;

            [oldResult, res] = await Promise.all([
              getSearchItems(' ', authToken),
              getSearchItems(req.params.keywords, authToken),
            ]);

            notice = res;
            throw new Error('Incomplete !!!');

            const result = ArraysChanges(oldResult.body, res.body);
            notice = result;

            expect(result.addedItems).toEqual([]);
            expect(result.deletedItems).toEqual([]);
          } catch (e) {
            handleException(notice, e);
          }
        });
      });
      describe('one keyword', () => {
        test('unusal case: blank prefix', async () => {
          req.params.keywords = ' Test';
          let notice;
          try {
            // 并行获取旧的和新的组数据
            let res;
            let oldResult;

            [oldResult, res] = await Promise.all([
              getSearchItems(' ', authToken),
              getSearchItems(req.params.keywords, authToken),
            ]);

            notice = res;
            const result = ArraysChanges(oldResult.body, res.body);
            notice = result;

            expect(result.addedItems).toEqual([]);
            expect(result.deletedItems).toEqual([]);
          } catch (e) {
            handleException(notice, e);
          }
        });
        test('unusal case: blank suffix', async () => {
          req.params.keywords = 'Test ';
          let notice;
          try {
            // 并行获取旧的和新的组数据
            let res;
            let oldResult;

            [oldResult, res] = await Promise.all([
              getSearchItems(' ', authToken),
              getSearchItems(req.params.keywords, authToken),
            ]);

            notice = res;
            const result = ArraysChanges(oldResult.body, res.body);
            notice = result;

            expect(result.addedItems).toEqual([]);
            expect(result.deletedItems).toEqual([]);
          } catch (e) {
            handleException(notice, e);
          }
        });
      });
      describe('two keyword', () => {
        test('split to two keyword', async () => {
          req.params.keywords = 'Test Title';
          let notice;
          try {
            const res = await getSearchItems(req.params.keywords, authToken);
            notice = res;
            throw new Error('Incompelte !!!');
          } catch (e) {
            handleException(notice, e);
          }
        });
      });
    });
    describe('two blank', () => {
      describe('onekeyword', () => {
        test('unusal case: blank prefix*2', async () => {
          req.params.keywords = '  Test';
          let notice;
          try {
            // 并行获取旧的和新的组数据
            let res;
            let oldResult;

            [oldResult, res] = await Promise.all([
              getSearchItems(' ', authToken),
              getSearchItems(req.params.keywords, authToken),
            ]);

            notice = res;
            const result = ArraysChanges(oldResult.body, res.body);
            notice = result;

            expect(result.addedItems).toEqual([]);
            expect(result.deletedItems).toEqual([]);
          } catch (e) {
            handleException(notice, e);
          }
        });
        test('unusal case: blank prefix and suffix', async () => {
          req.params.keywords = ' Test ';
          let notice;
          try {
            // 并行获取旧的和新的组数据
            let res;
            let oldResult;

            [oldResult, res] = await Promise.all([
              getSearchItems(' ', authToken),
              getSearchItems(req.params.keywords, authToken),
            ]);

            notice = res;
            const result = ArraysChanges(oldResult.body, res.body);
            notice = result;

            expect(result.addedItems).toEqual([]);
            expect(result.deletedItems).toEqual([]);
          } catch (e) {
            handleException(notice, e);
          }
        });
        test('unusal case: blank suffix*2', async () => {
          req.params.keywords = 'Test  ';
          let notice;
          try {
            // 并行获取旧的和新的组数据
            let res;
            let oldResult;

            [oldResult, res] = await Promise.all([
              getSearchItems(' ', authToken),
              getSearchItems(req.params.keywords, authToken),
            ]);

            notice = res;
            const result = ArraysChanges(oldResult.body, res.body);
            notice = result;

            expect(result.addedItems).toEqual([]);
            expect(result.deletedItems).toEqual([]);
          } catch (e) {
            handleException(notice, e);
          }
        });
      });
      describe('twokeyword', () => {
        test('unusal case: blank prefix', async () => {
          req.params.keywords = ' Test Title';
          let notice;
          try {
            // 并行获取旧的和新的组数据
            let res;
            let oldResult;

            [oldResult, res] = await Promise.all([
              getSearchItems(' ', authToken),
              getSearchItems(req.params.keywords, authToken),
            ]);

            notice = res;
            const result = ArraysChanges(oldResult.body, res.body);
            notice = result;

            expect(result.addedItems).toEqual([]);
            expect(result.deletedItems).toEqual([]);
          } catch (e) {
            handleException(notice, e);
          }
        });
        test('unusal case: blank *2 between', async () => {
          req.params.keywords = 'Test  Title';
          let notice;
          try {
            // 并行获取旧的和新的组数据
            let res;
            let oldResult;

            [oldResult, res] = await Promise.all([
              getSearchItems(' ', authToken),
              getSearchItems(req.params.keywords, authToken),
            ]);

            notice = res;
            const result = ArraysChanges(oldResult.body, res.body);
            notice = result;

            expect(result.addedItems).toEqual([]);
            expect(result.deletedItems).toEqual([]);
          } catch (e) {
            handleException(notice, e);
          }
        });
        test('unusal case: blank suffix', async () => {
          req.params.keywords = 'Test Title ';
          let notice;
          try {
            // 并行获取旧的和新的组数据
            let res;
            let oldResult;

            [oldResult, res] = await Promise.all([
              getSearchItems(' ', authToken),
              getSearchItems(req.params.keywords, authToken),
            ]);

            notice = res;
            const result = ArraysChanges(oldResult.body, res.body);
            notice = result;

            expect(result.addedItems).toEqual([]);
            expect(result.deletedItems).toEqual([]);
          } catch (e) {
            handleException(notice, e);
          }
        });
      });
    });
  });

  describe('Patch /groups/:group_id/items/:item_id', () => {
    req.params.group_id = '1';
    req.params.item_id = '1';
    req.body.targetItem_position = 1;

    beforeEach(async () => {
      req.params.group_id = '1';
      req.params.item_id = '1';
      req.body.targetItem_position = 1;
    });

    // test('moveItem(withinGroup): moves item within a group', async () => {
    //   const res = await patchItem(authToken)

    //   expect(res.status).toBe(200);
    //   expect(res.body).toEqual({ message: 'Item moved successfully', item_id: '1' });
    // });
    describe('401: JWT problem', () => {
      test('Missing JWT', async () => {
        let res;
        try {
          res = await patchItem(req.params.group_id, req.params.item_id, req.body);
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('Missing JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
      test('Invaild JWT', async () => {
        let res;
        try {
          res = await patchItem(req.params.group_id, req.params.item_id, req.body, 123);
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
          res = await patchItem(req.params.group_id, req.params.item_id, 123, authToken);
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
        req.body = {};
        let res;
        try {
          res = await patchItem(req.params.group_id, req.params.item_id, req.body, authToken),

            expect(res.status).toBe(400);
          expect(res.body.status).toMatch('fail');
          expect(res.body.message).toMatch('is required');
        } catch (e) {
          handleException(res, e);
        }
      });

      it('Undefined Field', async () => {
        req.body.username = 'user';
        let res;
        try {
          res = await patchItem(req.params.group_id, req.params.item_id, req.body, authToken);

          expect(res.status).toBe(400);
          expect(res.body.status).toMatch('fail');
          expect(res.body.message).toMatch('not allowed');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
    const typeChecks = extractFieldType(req.body);

    // Helper function to get test value based on type

    describe('400 Bad request: Field Data Format Error', () => {
      Object.entries(typeChecks).forEach(([type, fields]) => {
        fields.forEach((field) => {
          const testData = { ...req.body };

          // Generate test request data with specified type for the field
          Object.entries(getTestValueByType(type)).forEach(([writetype, writedvalue]) => {
            if (writetype !== type) {
              testData[field] = writedvalue;

              it(`${field} field required ${type} but ${writetype}`, async () => {
                let res;
                // console.log(testData);
                try {
                  res = await patchItem(req.params.group_id, req.params.item_id, req.body, authToken);
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
    test('moveItem: returns 404 if source group not found', async () => {
      let notice;
      try {
        req.params.group_id = '100'; // Non-existent group

        const res = await patchItem(req.params.group_id, req.params.item_id, req.body, authToken);
        notice = res;
        expect(res.status).toBe(404);
        // 斷言回應主體
        expect(res.body).toEqual({ message: 'Source group not found' });
      } catch (e) {
        handleException(notice, e);
      }
    });
    test('moveItem(toGroup): moves item from one group to another', async () => {
      req.body.targetGroup_id = '2';
      const res = await patchItem(req.params.group_id, req.params.item_id, req.body, authToken);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Item moved successfully', item_id: '1' });
    });
  });

  describe('Delete /groups/:group_id/items/:item_id', () => {
    beforeEach(() => {
      req.params.group_id = '2';
      req.params.item_id = '4';
    });
    describe('401: JWT problem', () => {
      test('Missing JWT', async () => {
        let res;
        try {
          res = await deleteItem(req.params.group_id, req.params.item_id);
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('Missing JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
      test('Invaild JWT', async () => {
        let res;
        try {
          res = await deleteItem(req.params.group_id, req.params.item_id, 123);
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('Invalid JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
    });

    test('deleteItem: deletes item from group', async () => {
      // 发送删除项目的 HTTP 请求
      const res = await deleteItem(req.params.group_id, req.params.item_id, authToken);

      expect(res.status).toBe(204);
    });

    test('deleteItem: returns 404 if group not found', async () => {
      req.params.group_id = '3'; // Non-existent group
      const res = await deleteItem(req.params.group_id, req.params.item_id, authToken);
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toEqual('Group or item not found');
    });
  });
};

module.exports = ItemTest;
