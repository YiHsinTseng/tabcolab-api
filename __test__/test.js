require('dotenv').config();

const { MongoClient } = require('mongodb');
const server = require('../server');

// 清空資料庫的函式
async function clearDatabase() {
  const { MONGODB_URI_LOCAL } = process.env;
  const MONGODB_URI = MONGODB_URI_LOCAL;
  const uri = MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    const database = client.db(); // 不指定数据库名称，因为它在 URI 中已经指定了
    // 删除数据库中的所有集合
    await database.dropDatabase();
  } finally {
    await client.close();
  }
}

// 在測試完成後清空資料庫
beforeAll(async () => {
  await clearDatabase();
});
// 開始測試前清空資料庫

// 多使用者併發測試
// const asyncPostGroupTest = require('./http/multi/asyncPostGroup');

// asyncPostGroupTest(server); // 開始測試

// 單一使用者併發測試
const soloTest = require('./http/solo/soloTest');

soloTest(server); // 開始測試
