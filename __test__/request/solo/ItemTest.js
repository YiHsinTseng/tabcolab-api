const request = require('supertest');
const { handleException } = require('../../utils/testErrorHandler');
const { groupsChanges, ArraysChanges } = require('../../utils/groupsChanges');
const { getGroup } = require('./GroupTest');
const { extractFieldType } = require('../../utils/extractFieldType');
const { testValues, getTestValueByType } = require('../../utils/FieldDataTypeTest');
const { testUserAction } = require('../../utils/testUserHelper');
const { UserRequestBodyTest } = require('../../classes/UserTest');

jest.mock('../../validations/uuid', () => ({
  checkUUIDv4Format: jest.fn().mockImplementation((value) => true),
}));

const ItemTest = async (server) => {
  let authToken;
  let userData = { email: 'user@example.com', password: 'mySecurePassword123' };
  beforeAll(async () => {
    userData = { email: 'user@example.com', password: 'mySecurePassword123' };
    const res = await request(server)
      .post('/api/1.0/users/login')
      .send(userData);
    authToken = res.body.token;
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
      it('Missing JWT', async () => {
        let res;
        try {
          res = await testUserAction(getSearchItems, [req.params.keywords], 401, 'fail', 'Missing JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
      it('Invalid JWT', async () => {
        let res;
        try {
          res = await testUserAction(getSearchItems, [req.params.keywords, 123], 401, 'fail', 'Invalid JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
    describe('no blank', () => {
      describe('no keyword', () => {
        it('empty keyword para', async () => {
          req.params.keywords = '     ';
          let notice;
          try {
            const res = await getSearchItems(req.params.keywords, authToken);
            console.log(res.body);
            notice = res;
            // throw new Error('Incompelte !!!');
          } catch (e) {
            handleException(notice, e);
          }
        });
      });
      //   describe('one keyword', () => {
      //     test('onekeyword within a group', async () => {
      //       req.params.keywords = 'Tab';
      //       let notice;

      //       try {
      //         // 并行获取旧的和新的组数据
      //         let res;
      //         let oldResult;

      //         [oldResult, res] = await Promise.all([
      //           getSearchItems('tab', authToken),
      //           getSearchItems(req.params.keywords, authToken),
      //         ]);

      //         notice = res;
      //         const result = ArraysChanges(oldResult.body, res.body);
      //         notice = result;

      //         expect(result.addedItems).toEqual([]);
      //         expect(result.deletedItems).toEqual([]);
      //       } catch (e) {
      //         handleException(notice, e);
      //       }
      //     });
      //     test('onekeyword in different groups', async () => {
      //       req.params.keywords = 'tab';
      //       let notice;
      //       try {
      //         // 并行获取旧的和新的组数据
      //         let res;
      //         let oldResult;

      //         [oldResult, res] = await Promise.all([
      //           getSearchItems(' ', authToken),
      //           getSearchItems(req.params.keywords, authToken),
      //         ]);

      //         notice = res;
      //         const result = ArraysChanges(oldResult.body, res.body);
      //         notice = result;
      //         expect(result.addedItems).toEqual([]);
      //         expect(result.deletedItems).toEqual([]);
      //         throw new Error('Incomplete !!!');
      //       } catch (e) {
      //         handleException(notice, e);
      //       }
      //     });
      //     test('onekeyword not in groups', async () => {
      //       req.params.keywords = 'xxxxxx';
      //       let notice;
      //       try {
      //         const res = await getSearchItems(req.params.keywords, authToken);
      //         notice = res;
      //         expect(res.body).toEqual([]);
      //         // throw new Error('Incompelte !!!');
      //       } catch (e) {
      //         handleException(notice, e);
      //       }
      //     });
      //   });
      // });
      // describe('single blank', () => {
      //   describe('no keyword', () => {
      //     test('no keyword return All', async () => {
      //       req.params.keywords = ' ';
      //       let notice;
      //       try {
      //         // 并行获取旧的和新的组数据
      //         let res;
      //         let oldResult;

      //         [oldResult, res] = await Promise.all([
      //           getSearchItems(' ', authToken),
      //           getSearchItems(req.params.keywords, authToken),
      //         ]);

      //         notice = res;
      //         throw new Error('Incomplete !!!');

      //         const result = ArraysChanges(oldResult.body, res.body);
      //         notice = result;

      //         expect(result.addedItems).toEqual([]);
      //         expect(result.deletedItems).toEqual([]);
      //       } catch (e) {
      //         handleException(notice, e);
      //       }
      //     });
      //   });
      //   describe('one keyword', () => {
      //     test('unusal case: blank prefix', async () => {
      //       req.params.keywords = ' Test';
      //       let notice;
      //       try {
      //         // 并行获取旧的和新的组数据
      //         let res;
      //         let oldResult;

      //         [oldResult, res] = await Promise.all([
      //           getSearchItems(' ', authToken),
      //           getSearchItems(req.params.keywords, authToken),
      //         ]);

      //         notice = res;
      //         const result = ArraysChanges(oldResult.body, res.body);
      //         notice = result;

      //         expect(result.addedItems).toEqual([]);
      //         expect(result.deletedItems).toEqual([]);
      //       } catch (e) {
      //         handleException(notice, e);
      //       }
      //     });
      //     test('unusal case: blank suffix', async () => {
      //       req.params.keywords = 'Test ';
      //       let notice;
      //       try {
      //         // 并行获取旧的和新的组数据
      //         let res;
      //         let oldResult;

      //         [oldResult, res] = await Promise.all([
      //           getSearchItems(' ', authToken),
      //           getSearchItems(req.params.keywords, authToken),
      //         ]);

      //         notice = res;
      //         const result = ArraysChanges(oldResult.body, res.body);
      //         notice = result;

      //         expect(result.addedItems).toEqual([]);
      //         expect(result.deletedItems).toEqual([]);
      //       } catch (e) {
      //         handleException(notice, e);
      //       }
      //     });
      //   });
      //   describe('two keyword', () => {
      //     test('split to two keyword', async () => {
      //       req.params.keywords = 'Test Title';
      //       let notice;
      //       try {
      //         const res = await getSearchItems(req.params.keywords, authToken);
      //         notice = res;
      //         throw new Error('Incompelte !!!');
      //       } catch (e) {
      //         handleException(notice, e);
      //       }
      //     });
      //   });
    });
    //   describe('two blank', () => {
    //     describe('onekeyword', () => {
    //       test('unusal case: blank prefix*2', async () => {
    //         req.params.keywords = '  Test';
    //         let notice;
    //         try {
    //           // 并行获取旧的和新的组数据
    //           let res;
    //           let oldResult;

    //           [oldResult, res] = await Promise.all([
    //             getSearchItems(' ', authToken),
    //             getSearchItems(req.params.keywords, authToken),
    //           ]);

    //           notice = res;
    //           const result = ArraysChanges(oldResult.body, res.body);
    //           notice = result;

    //           expect(result.addedItems).toEqual([]);
    //           expect(result.deletedItems).toEqual([]);
    //         } catch (e) {
    //           handleException(notice, e);
    //         }
    //       });
    //       test('unusal case: blank prefix and suffix', async () => {
    //         req.params.keywords = ' Test ';
    //         let notice;
    //         try {
    //           // 并行获取旧的和新的组数据
    //           let res;
    //           let oldResult;

    //           [oldResult, res] = await Promise.all([
    //             getSearchItems(' ', authToken),
    //             getSearchItems(req.params.keywords, authToken),
    //           ]);

    //           notice = res;
    //           const result = ArraysChanges(oldResult.body, res.body);
    //           notice = result;

    //           expect(result.addedItems).toEqual([]);
    //           expect(result.deletedItems).toEqual([]);
    //         } catch (e) {
    //           handleException(notice, e);
    //         }
    //       });
    //       test('unusal case: blank suffix*2', async () => {
    //         req.params.keywords = 'Test  ';
    //         let notice;
    //         try {
    //           // 并行获取旧的和新的组数据
    //           let res;
    //           let oldResult;

    //           [oldResult, res] = await Promise.all([
    //             getSearchItems(' ', authToken),
    //             getSearchItems(req.params.keywords, authToken),
    //           ]);

    //           notice = res;
    //           const result = ArraysChanges(oldResult.body, res.body);
    //           notice = result;

    //           expect(result.addedItems).toEqual([]);
    //           expect(result.deletedItems).toEqual([]);
    //         } catch (e) {
    //           handleException(notice, e);
    //         }
    //       });
    //     });
    //     describe('twokeyword', () => {
    //       test('unusal case: blank prefix', async () => {
    //         req.params.keywords = ' Test Title';
    //         let notice;
    //         try {
    //           // 并行获取旧的和新的组数据
    //           let res;
    //           let oldResult;

    //           [oldResult, res] = await Promise.all([
    //             getSearchItems(' ', authToken),
    //             getSearchItems(req.params.keywords, authToken),
    //           ]);

    //           notice = res;
    //           const result = ArraysChanges(oldResult.body, res.body);
    //           notice = result;

    //           expect(result.addedItems).toEqual([]);
    //           expect(result.deletedItems).toEqual([]);
    //         } catch (e) {
    //           handleException(notice, e);
    //         }
    //       });
    //       test('unusal case: blank *2 between', async () => {
    //         req.params.keywords = 'Test  Title';
    //         let notice;
    //         try {
    //           // 并行获取旧的和新的组数据
    //           let res;
    //           let oldResult;

    //           [oldResult, res] = await Promise.all([
    //             getSearchItems(' ', authToken),
    //             getSearchItems(req.params.keywords, authToken),
    //           ]);

    //           notice = res;
    //           const result = ArraysChanges(oldResult.body, res.body);
    //           notice = result;

    //           expect(result.addedItems).toEqual([]);
    //           expect(result.deletedItems).toEqual([]);
    //         } catch (e) {
    //           handleException(notice, e);
    //         }
    //       });
    //       test('unusal case: blank suffix', async () => {
    //         req.params.keywords = 'Test Title ';
    //         let notice;
    //         try {
    //           // 并行获取旧的和新的组数据
    //           let res;
    //           let oldResult;

    //           [oldResult, res] = await Promise.all([
    //             getSearchItems(' ', authToken),
    //             getSearchItems(req.params.keywords, authToken),
    //           ]);

    //           notice = res;
    //           const result = ArraysChanges(oldResult.body, res.body);
    //           notice = result;

    //           expect(result.addedItems).toEqual([]);
    //           expect(result.deletedItems).toEqual([]);
    //         } catch (e) {
    //           handleException(notice, e);
    //         }
    //       });
    //     });
    //   });
  });

  describe('Patch /groups/:group_id/items/:item_id', () => {
    req.params.group_id = '1';
    req.params.item_id = '1';
    let moveItemRequest = { targetGroup_id: '2', targetItem_position: 1 };
    beforeEach(async () => {
      req.params.group_id = '1';
      req.params.item_id = '1';
      moveItemRequest = { targetGroup_id: '2', targetItem_position: 1 };
    });
    describe('401: JWT problem', () => {
      it('Missing JWT', async () => {
        let res;
        try {
          res = await testUserAction(patchItem, [req.params.group_id, req.params.item_id, moveItemRequest], 401, 'fail', 'Missing JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
      it('Invalid JWT', async () => {
        let res;
        try {
          res = await testUserAction(patchItem, [req.params.group_id, req.params.item_id, moveItemRequest, 123], 401, 'fail', 'Invalid JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
    describe('400 Bad request: Body Format Error', () => {
      const itemTest = new UserRequestBodyTest(patchItem, userData, moveItemRequest);
      it('JSON Format Error', async () => {
        const invalidJson = '{ targetItem_position: }';
        await itemTest.jsonFormatError(invalidJson, [req.params.group_id, req.params.item_id]);
      });
      it('No field', async () => {
        await itemTest.noField({}, authToken, 'Invalid request body', [req.params.group_id, req.params.item_id]);
      });
      it('Undefined Field', async () => {
        await itemTest.undefinedField(authToken, 'not allowed', [req.params.group_id, req.params.item_id]);
      });
      // describe('Missing field', () => {
      //   itemTest.missingField(authToken);
      // });
    });
    describe('400 Bad request: Field Data Format Error', () => {
      const itemTest = new UserRequestBodyTest(patchItem, userData, moveItemRequest);
      itemTest.fieldDataFormatError(authToken, [req.params.group_id, req.params.item_id]);
    });
    it('moveItem: returns 404 if source group not found', async () => {
      let res;
      try {
        req.params.group_id = '100'; // Non-existent group
        res = await testUserAction(patchItem, [req.params.group_id, req.params.item_id, moveItemRequest, authToken], 404, 'fail', 'Source group not found');
      } catch (e) {
        handleException(res, e);
      }
    });

    it('moveItem(toGroup): moves item from one group to another', async () => {
      let res;
      try {
        res = await testUserAction(patchItem, [req.params.group_id, req.params.item_id, moveItemRequest, authToken], 200, 'success', 'Item moved successfully');
      } catch (e) {
        handleException(res, e);
      }
    });
  });

  describe('Delete /groups/:group_id/items/:item_id', () => {
    beforeEach(() => {
      req.params.group_id = '2';
      req.params.item_id = '4';
    });
    describe('401: JWT problem', () => {
      it('Missing JWT', async () => {
        let res;
        try {
          res = await testUserAction(deleteItem, [req.params.group_id, req.params.item_id], 401, 'fail', 'Missing JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
      it('Invalid JWT', async () => {
        let res;
        try {
          res = await testUserAction(deleteItem, [req.params.group_id, req.params.item_id, 123], 401, 'fail', 'Invalid JWT');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
    it('deleteItem: deletes item from group', async () => {
      let res;
      try {
        res = await testUserAction(deleteItem, [req.params.group_id, req.params.item_id, authToken], 204, null);
      } catch (e) {
        handleException(res, e);
      }
    });

    it('deleteItem: returns 404 if group not found', async () => {
      req.params.group_id = '3'; // Non-existent group
      let res;
      try {
        res = await testUserAction(deleteItem, [req.params.group_id, req.params.item_id, authToken], 404, 'fail', 'Group or item not found');
      } catch (e) {
        handleException(res, e);
      }
    });
  });
};

module.exports = ItemTest;
