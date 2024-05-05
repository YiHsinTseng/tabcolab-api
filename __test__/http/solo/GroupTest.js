const request = require('supertest');

const createGroup = async (server, authToken, newGroupData) => request(server)
  .post('/api/1.0/groups')
  .set('Authorization', `Bearer ${authToken}`)
  .send(newGroupData);

const GroupTest = async (server) => {
  let authToken;

  beforeAll(async () => {
    const userData = { email: 'user@gmail.com', password: 'password1' };
    const response = await request(server)
      .post('/api/1.0/users/login')
      .send(userData);
    authToken = response.body.token;
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
  }; // 初始化 newGroupData

  describe('POST /group', () => {
    beforeEach(() => {
      resetNewGroupData(); // 在每個測試案例前重新設置 newGroupData
    });

    it('should successfully create a group', async () => {
      const response = await createGroup(server, authToken, newGroupData);
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'Group created at blank successfully',
        group_id: expect.any(String),
      });
    });

    it('should fail if icon type is not string', async () => {
      newGroupData.group_icon = 1;
      const response = await createGroup(server, authToken, newGroupData);
      expect(response.status).toBe(400);
      expect(response.body.errors).toMatch('must be a string');
    });

    it('should fail if title type is not string', async () => {
      newGroupData.group_title = 1;
      const response = await createGroup(server, authToken, newGroupData);
      expect(response.status).toBe(400);
      expect(response.body.errors).toMatch('must be a string');
    });
  });
};

module.exports = GroupTest;
