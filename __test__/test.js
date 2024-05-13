require('dotenv').config();
const fs = require('fs');
const { MongoClient } = require('mongodb');
const { UserGroup } = require('../src/models/group');
const User = require('../src/models/user');
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

// 將 JSON 資料存入資料庫的函式
async function saveJSONToMongoDB(jsonData) {
  try {
    // 創建新的使用者模型實例
    const newUser = new User({
      _id: jsonData.users[0].user_id, // 使用 user_id 作為 _id
      email: jsonData.users[0].email,
      password: 'mySecurePassword123',
      // 其他欄位...
    });

    await newUser.generateAuthToken();
    // 將使用者存入資料庫
    const savedUser = await newUser.save();
    savedUser;
    // console.log('User saved to MongoDB:', savedUser);
  } catch (error) {
    console.error('Error saving user to MongoDB:', error);
  }

  try {
    // 創建新的使用者群組模型實例
    const newUserGroup = new UserGroup(jsonData.user_groups[0]);
    // 將使用者群組存入資料庫
    const savedUserGroup = await newUserGroup.save();
    savedUserGroup;
    // console.log('UserGroup saved to MongoDB:', savedUserGroup);
  } catch (error) {
    console.error('Error saving UserGroup to MongoDB:', error);
  }

  // console.log('start');
  // console.log(await User.findOne({ email: 'user@example.com' }));
}

// 將 JSON 資料加載到資料庫中的函式
async function loadJSONToMongoDB() {
  try {
    const jsonData = await new Promise((resolve, reject) => {
      // 讀取 JSON 檔案
      fs.readFile('./__test__/request/db.json', 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(JSON.parse(data));
      });
    });

    // 呼叫函式將資料存入資料庫
    await saveJSONToMongoDB(jsonData);
  } catch (error) {
    console.error('Error loading JSON to MongoDB:', error);
  }
}

// 在所有測試之前先清空資料庫，然後加載 JSON 資料到資料庫中
beforeAll(async () => {
  await clearDatabase();
  await loadJSONToMongoDB();
});

// 多使用者併發測試
// const asyncPostGroupTest = require('./http/multi/asyncPostGroup');
// asyncPostGroupTest(server); // 開始測試

// 單一使用者併發測試
const soloTest = require('./request/solo/soloTest');

soloTest(server); // 開始測試
