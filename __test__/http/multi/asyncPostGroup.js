const { Cluster } = require('puppeteer-cluster');
const request = require('supertest');
// const server = require('../../prod-server/server');

// K6
const asyncPostGroup = (server) => {
  const numCount = 3; // 设置群组数量105就是上限，會導致內存泄露

  let authTokens = [];
  const newGroupDataArray = Array.from({ length: numCount }, (_, i) => ({
    group_icon: `icon-url${i + 1}`,
    group_title: `New Group ${i + 1}`,
  }));

  beforeEach(async () => {
    const userData = Array.from({ length: numCount }, (_, i) => ({
      email: `userx${i + 1}@gmail.com`,
      password: `password${i + 1}`,
    }));

    authTokens = await Promise.all(userData.map(async (data) => {
      const response = await request(server)
        .post('/api/1.0/users/register')
        .send(data);
      return response.body.token;
    }));
  });

  // afterEach(async () => {
  //   await Promise.all(authTokens.map(async (token) => {
  //     await request(server)
  //       .delete('/api/1.0/user')
  //       .set('Authorization', `Bearer ${token}`);
  //   }));
  // });

  describe('POST /users/register', () => {
    it('registers users and gets JWTs', async () => {
      const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: authTokens.length,
      // monitor: true, // 不會比較快
      });

      await cluster.task(async ({ page, data: { authToken, newGroupData } }) => {
        const PostGroupResponse = await request(server)
          .post('/api/1.0/groups')
          .set('Authorization', `Bearer ${authToken}`)
          .send(newGroupData);

        expect(PostGroupResponse.status).toBe(201);

        const getGroups = await request(server)
          .get('/api/1.0/groups')
          .set('Authorization', `Bearer ${authToken}`);

        // console.log(getGroups.body);
        expect(getGroups.status).toBe(200);
      });

      authTokens.forEach((authToken, index) => {
        cluster.queue({ authToken, newGroupData: newGroupDataArray[index] });
      });

      await cluster.idle();
      await cluster.close();
    }, 500000);
  });
};

module.exports = asyncPostGroup;
