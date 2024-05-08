const request = require('supertest');
const { handleException } = require('../../utils/testErrorHandler');
const { groupsChanges } = require('../../utils/groupsChanges');

// 要不要有測試資料集單獨測試各功能，要有。

const GroupTest = async (server) => {
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
    getGroup, postGroup, patchGroup, deleteGroup,
  } = require('../apis/groupsAPI');

  describe('Get /groups', () => {
    it('200: success', async () => {
      let notice;
      try {
        const res = await getGroup(authToken);
        notice = res;

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        // 驗證每個元素是否都是物件並且包含特定屬性
        res.body.forEach((group) => {
          expect(typeof group).toBe('object');
          expect(group).toHaveProperty('group_id');
          expect(group).toHaveProperty('group_icon');
          expect(group).toHaveProperty('group_title');
          expect(Array.isArray(group.items)).toBe(true);

          group.items.forEach((item) => {
            expect(item).toHaveProperty('item_id');
            expect(item).toHaveProperty('item_type');

            // 根據 item_type 的不同，驗證其他屬性是否存在
            if (item.item_type === 0) {
              expect(item).toHaveProperty('browserTab_favIconURL');
              expect(item).toHaveProperty('browserTab_title');
              expect(item).toHaveProperty('browserTab_url');
              expect(item).toHaveProperty('browserTab_id');
              expect(item).toHaveProperty('browserTab_index');
              expect(item).toHaveProperty('browserTab_active');
              expect(item).toHaveProperty('browserTab_status');
              expect(item).toHaveProperty('windowId');
            } else if (item.item_type === 1) {
              expect(item).toHaveProperty('note_content');
              expect(item).toHaveProperty('note_bgColor');
            } else if (item.item_type === 2) {
              expect(item).toHaveProperty('doneStatus');
              expect(item).toHaveProperty('note_content');
              expect(item).toHaveProperty('note_bgColor');
            }
          });
        });
      } catch (e) {
        handleException(notice, e);
      }
    });
    it('404: no cotent', async () => {
      let res;
      try {
        res = await getGroup(authToken);

        expect(res.status).toBe(404);
        expect(res.body.status).toBe('fail');
        expect(res.body.message).toBe('No groups found for the user');
      } catch (e) {
        console.log(typeof (res.body));
        handleException(res, e);
      }
    });
    describe('401: JWT problem', () => {
      it('Missing Field', async () => {
        let res;
        try {
          res = await getGroup();
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('Missing JWT token');
        } catch (e) {
          handleException(res, e);
        }
      });
      it('Undefined Field', async () => {
        let res;
        try {
          res = await getGroup(123);
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('Invalid JWT token');
        } catch (e) {
          handleException(res, e);
        }
      });
    });
  });

  describe('POST /group', () => {
    beforeEach(() => {
      resetNewGroupData(); // 在每個測試案例前重新設置 newGroupData
    });
    const resetNewGroupData = () => {
      // 重置 newGroupData
      newGroupData = {
        group_icon: 'icon-url',
        group_title: 'New Group',
      };
    };

    let newGroupData = {
      group_icon: 'icon-url',
      group_title: 'New Group',
    }; //

    describe('createGroup(Blank): should create a new group => 前端已棄用僅供測試', () => {
      it('201: should successfully create a new group', async () => {
        let res;
        try {
          const oldResult = await getGroup(authToken);

          res = await postGroup(newGroupData, authToken);
          expect(res.status).toBe(201);
          expect(res.body).toEqual({
            message: 'Group created at blank successfully',
            group_id: expect.any(String),
          });
          const groupID = res.body.group_id;

          const newResult = await getGroup(authToken);
          const result = groupsChanges(oldResult.body, newResult.body);
          // console.log(result);
          expect(result.addedItems[0].group_id).toBe(groupID);
          expect(result.addedItems[0].items).toEqual([]);
        } catch (e) {
          handleException(res, e);
        }
      });
    });
    describe('createGroup(SidebarTab)', () => {
      let newSidebarTabData;
      beforeEach(() => {
        newSidebarTabData = {
          group_icon: 'test_group_icon',
          group_title: 'test_group_title',
          browserTab_favIconURL: 'test_favIconURL',
          browserTab_title: 'SidebarTab_title',
          browserTab_url: 'test_url',
          browserTab_id: 456,
          browserTab_index: 7,
          browserTab_active: false,
          browserTab_status: 'complete',
          windowId: 8438513405,
        }; // 初始化 newGroupData
      });
      it('201: create SidebarTab within a new group', async () => {
        // newItemId = res.body.item_id; // 因為是非同步，無法傳給全域變數
        // newGroupId = res.body.group_id; // 因為是非同步，無法傳給全域變數
        let notice;
        try {
        // 并行获取旧的和新的组数据
          let res;
          let oldResult;
          let newResult;

          [oldResult, res] = await Promise.all([
            getGroup(authToken),
            postGroup(newSidebarTabData, authToken),
          ]);
          notice = res;
          // 检查创建组的响应
          expect(res.status).toBe(201);
          expect(res.body).toEqual({
            message: 'Group created with sidebar tab successfully ',
            item_id: expect.any(String),
            group_id: expect.any(String),
          });

          const groupID = res.body.group_id;
          const itemID = res.body.item_id;

          // 获取新的组数据
          newResult = await getGroup(authToken);

          // 计算更改
          const result = groupsChanges(oldResult.body, newResult.body);
          notice = result;
          // console.log(JSON.stringify(result, null, 2));

          // 检查更改结果
          expect(result.addedItems[0].group_id).toBe(groupID);
          // console.log(result.addedItems[0].items[0].item_id);
          expect(result.addedItems[0].items[0].item_id).toBe(itemID);
          expect(result.addedItems[0].items[0].item_type).toBe(0);
        } catch (e) {
          handleException(notice, e);
        }
      });
    });
    describe('createGroup(GroupTab) => 測試吃不到既有groupID和itemID', () => {
      let newGroupTabData;
      beforeEach(() => {
        newGroupTabData = { // 如何控制不確定變數
          group_icon: 'test_group_icon',
          group_title: 'test_group_title',
          sourceGroup_id: '2', // 如果造假特定GroupID
          item_id: '4', // 前端如果沒有到要怎樣打 //item_id不等於_id
        };
      });

      it('201: create GroupTab within a new group', async () => {
        let notice;
        try {
        // 并行获取旧的和新的组数据
          let res;
          let oldResult;
          let newResult;

          [oldResult, res] = await Promise.all([
            getGroup(authToken),
            postGroup(newGroupTabData, authToken),
          ]);
          notice = res;

          // console.log(res.body);
          // 检查创建组的响应
          expect(res.status).toBe(201);
          expect(res.body).toEqual({
            message: 'Group created with group tab successfully',
            group_id: expect.any(String),
          });

          // 获取新的组数据
          newResult = await getGroup(authToken);

          // 计算更改
          const result = groupsChanges(oldResult.body, newResult.body);
          notice = result;
          // console.log(JSON.stringify(result, null, 2));

          // 检查更改结果
          expect(result.addedItems[0].group_id).toBe(res.body.group_id);
          expect(result.addedItems[0].items[0].item_id).toBe(newGroupTabData.item_id);
          expect(result.addedItems[0].items[0].item_type).toBe(0);
        } catch (e) {
          handleException(notice, e);
        }
      });
      describe('404 => 測試吃不到既有groupID和itemID', () => {
        it('404: invalid groupID', async () => {
          // console.log(newGroupTabData);
          newGroupTabData.sourceGroup_id = '100';
          let res;
          let notice = res;
          try {
          // 并行获取旧的和新的组数据
            let oldResult;
            let newResult;

            [oldResult, res] = await Promise.all([
              getGroup(authToken),
              postGroup(newGroupTabData, authToken),
            ]);
            expect(res.status).toBe(404);
            expect(res.body).toEqual({
              status: 'fail',
              message: 'Group not found or invalid group ID',
            });

            // 获取新的组数据
            newResult = await getGroup(authToken);

            // 计算更改
            const result = groupsChanges(oldResult.body, newResult.body);
            notice = result;
            // console.log(result);
            // console.log(result.addedItems);
            expect(result.addedItems).toEqual([]);
            expect(result.deletedItems).toEqual([]);
          } catch (e) {
            handleException(notice, e);
          }
        });
        it('404: invalid item ID', async () => {
          newGroupTabData.item_id = '100';
          let notice;
          try {
            let res;
            let oldResult;
            let newResult;
            let result;

            [oldResult, res] = await Promise.all([
              getGroup(authToken),
              postGroup(newGroupTabData, authToken),
            ]);
            notice = res;
            expect(res.status).toBe(404);
            // console.log(res.body);
            expect(res.body).toEqual({
              status: 'fail',
              message: 'Item no found in group',
            });
            newResult = await getGroup(authToken);

            // // 计算更改
            result = groupsChanges(oldResult.body, newResult.body);
            notice = result;

            expect(result.addedItems).toEqual([]);
            expect(result.deletedItems).toEqual([]);
          } catch (e) {
            handleException(notice, e);
          }
        });
      });
    });
    // describe('400 Bad request: Body Format Error=>怎樣一次測全部', () => { // 不好測//要一次測完
    //   it('should fail if icon type is not string', async () => {
    //     newGroupData.group_icon = 1; // 不確定是不是requet的鍋
    //     let res;
    //     try {
    //       res = await postGroup(newGroupData, authToken);
    //       expect(res.status).toBe(400);
    //       expect(res.body.errors).toMatch('must be a string');
    //     } catch (e) {
    //       handleException(res, e);
    //     }
    //   });

    //   it('should fail if title type is not string', async () => {
    //     newGroupData.group_title = 1; // 不確定是不是requet的鍋
    //     let res;
    //     try {
    //       res = await postGroup(newGroupData, authToken);
    //       expect(res.status).toBe(400);
    //       expect(res.body.errors).toMatch('must be a string');
    //     } catch (e) {
    //       handleException(res, e);
    //     }
    //   });
    // });
    // describe('400 Bad request: Field Error=>怎樣一次測全部', () => {});
    // describe('401: JWT problem', () => {
    //   it('Missing Field', async () => {
    //     let res;
    //     try {
    //       res = await postGroup(newGroupData);
    //       expect(res.status).toBe(401);
    //       expect(res.body.message).toBe('Missing JWT token');
    //     } catch (e) {
    //       handleException(res, e);
    //     }
    //   });
    //   it('Undefined Field', async () => {
    //     let res;
    //     try {
    //       res = await postGroup(newGroupData, 123);
    //       expect(res.status).toBe(401);
    //       expect(res.body.message).toBe('Invalid JWT token');
    //     } catch (e) {
    //       handleException(res, e);
    //     }
    //   });
    // });
  });

  // describe('PATCH /groups/:group_id', () => {
  //   const groupId = '10'; // 假設這是要刪除的群組的ID，無法預先指定
  //   let patchGroupRequest;
  //   it('200: Patch Group Title', async () => {
  //     patchGroupRequest = {
  //       group_title: 'Updated Group Title',
  //     };
  //     let res;
  //     try {
  //       res = await patchGroup(groupId, patchGroupRequest, authToken);
  //       expect(res.status).toBe(200);
  //     } catch (e) {
  //       handleException(res, e);
  //     }
  //   });
  //   it('200: Patch Group Icon', async () => {
  //     patchGroupRequest = {
  //       group_icon: 'https://example.com/updated_icon.png',
  //     };
  //     let res;
  //     try {
  //       res = await patchGroup(groupId, patchGroupRequest, authToken);
  //       expect(res.status).toBe(200);
  //     } catch (e) {
  //       handleException(res, e);
  //     }
  //   });
  //   describe('401: JWT problem', () => {
  //     it('Missing Field', async () => {
  //       let res;
  //       try {
  //         res = await patchGroup(groupId, patchGroupRequest);
  //         expect(res.status).toBe(401);
  //         expect(res.body.message).toBe('Missing JWT token');
  //       } catch (e) {
  //         handleException(res, e);
  //       }
  //     });
  //     it('Undefined Field', async () => {
  //       let res;
  //       try {
  //         res = await patchGroup(groupId, patchGroupRequest, 123);
  //         expect(res.status).toBe(401);
  //         expect(res.body.message).toBe('Invalid JWT token');
  //       } catch (e) {
  //         handleException(res, e);
  //       }
  //     });
  //   });
  //   it('404: invaild Group ID', async () => {
  //     const groupId = '10'; // 假設這是要刪除的群組的ID，無法預先指定
  //     patchGroupRequest = {
  //       group_icon: 'https://example.com/updated_icon.png',
  //     };
  //     let res;
  //     try {
  //       res = await patchGroup(groupId, patchGroupRequest, authToken);
  //       expect(res.status).toBe(404);
  //       expect(res.body.message).toBe('Group not found or invalid group ID');
  //     } catch (e) {
  //       handleException(res, e);
  //     }
  //   });
  // });

  describe('Delete /groups/:group_id', () => {
    let groupIdToDelete = '10'; // 假設這是要刪除的群組的ID，無法預先指定
    it('404: valid groupId', async () => {
      groupIdToDelete = '100'; // 假設這是要刪除的群組的ID，無法預先指定
      let notice;
      try {
        let res;
        let oldResult;
        let newResult;
        let result;

        [oldResult, res] = await Promise.all([
          getGroup(authToken),
          deleteGroup(groupIdToDelete, authToken),
        ]);

        expect(res.status).toBe(404);
        // console.log(res.body);
        expect(res.body).toEqual({
          status: 'fail',
          message: 'Group not found',
        });
        newResult = await getGroup(authToken);

        // // 计算更改
        result = groupsChanges(oldResult.body, newResult.body);
        notice = result;

        expect(result.addedItems).toEqual([]);
        expect(result.deletedItems).toEqual([]);
      } catch (e) {
        handleException(notice, e);
      }
    });
    // describe('400 Bad request: Body Format Error=>groupID無法在測試中取得怎樣一次測全部', () => { // 不好測//要一次測完
    //   it('should fail if icon type is not string', async () => {
    //     let res;
    //     try {
    //       res = await deleteGroup(groupIdToDelete, authToken);
    //       expect(res.status).toBe(400);
    //       expect(res.body.errors).toMatch('must be a string');
    //     } catch (e) {
    //       handleException(res, e);
    //     }
    //   });

    //   it('should fail if title type is not string', async () => {
    //     let res;
    //     try {
    //       res = await deleteGroup(groupIdToDelete, authToken);
    //       expect(res.status).toBe(400);
    //       expect(res.body.errors).toMatch('must be a string');
    //     } catch (e) {
    //       handleException(res, e);
    //     }
    //   });
    // });
    // describe('400 Bad request: Field Error=>怎樣一次測全部', () => {});
    // describe('401: JWT problem', () => {
    //   it('Missing Field', async () => {
    //     let res;
    //     try {
    //       res = await deleteGroup(groupIdToDelete);
    //       expect(res.status).toBe(401);
    //       expect(res.body.message).toBe('Missing JWT token');
    //     } catch (e) {
    //       handleException(res, e);
    //     }
    //   });
    //   it('Undefined Field', async () => {
    //     let res;
    //     try {
    //       res = await deleteGroup(groupIdToDelete, 123);
    //       expect(res.status).toBe(401);
    //       expect(res.body.message).toBe('Invalid JWT token');
    //     } catch (e) {
    //       handleException(res, e);
    //     }
    //   });
    // });
    it('204: valid groupId', async () => {
      groupIdToDelete = '10'; // 假設這是要刪除的群組的ID，無法預先指定

      let res;
      try {
        res = await getGroup(authToken);
        const oldJson = res.body;

        res = await deleteGroup(groupIdToDelete, authToken);
        // console.log(res.body);
        expect(res.status).toBe(200);

        res = await getGroup(authToken);
        const newJson = res.body;
        // console.log(res.body);
        const result = groupsChanges(oldJson, newJson);
        // console.log(result.deletedItems[0].group_id);
        // console.log(result);
        expect(result.deletedItems[0].group_id).toBe('10');
      } catch (e) {
        handleException(res, e);
      }
    });
  });
};

module.exports = GroupTest;
