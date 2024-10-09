const request = require('supertest');

const soloTest = (server) => {
  // let authToken;

  // beforeAll(async () => {
  //   const userData = { email: 'user@gmail.com', password: 'password1' };
  //   const response = await request(server)
  //     .post('/api/1.0/users/register')
  //     .send(userData);
  //   response;
  //   // authToken = response.body.token;
  // });

  // afterAll(async () => {
  //   const deleteUser = await request(server)
  //     .delete('/api/1.0/user')
  //     .set('Authorization', `Bearer ${authToken}`);
  // });

  // it('Test Login', async () => {
  //   const userData = { email: 'user@example.com', password: 'mySecurePassword123' };
  //   const response = await request(server)
  //     .post('/api/1.0/users/login')
  //     .send(userData);
  //   console.log(123);
  //   console.log(response.body);
  // });
  // 需要做好測試規劃
  // TODO 我會需要將所有路由轉成request的格式
  // TODO 也要把個別API所以可能的錯誤情境列出
  // TODO 統一要先登入，token必須用test實例傳遞要寫在一起，變成說混合會有點困難
  // beforeAll會接續傳遞給async的test實例
  // 引用request格式對應到 實際API
  // 多次登入沒關係
  // 寫入用例

  jest.mock('../../validations/uuid');
  const { checkUUIDv4Format } = jest.requireMock('../../validations/uuid');// 在此次測試的test.js中全局替換，只是為了暫時不報錯。但可在別的test.js中測試
  checkUUIDv4Format.mockImplementation((value) => true);

  const UserTest = require('./UserTest');
  describe('User Controller API Endpoints', () => {
    UserTest(server);
  });

  const GroupTest = require('./GroupTest');
  describe('Group Controller API Endpoints', () => {
    GroupTest(server); // authToken要在async中傳值
  });

  const ItemTest = require('./ItemTest');
  describe('Item Controller API Endpoints', () => {
    ItemTest(server);
  });

  const SpecItemTest = require('./SpecItemTest');
  describe('SpecItem Controller API Endpoints', () => {
    SpecItemTest(server);
  });
};

module.exports = soloTest;
