const fs = require('fs');

const config = require('../../configs/config.json');

const env = process.env.NODE_ENV || 'development';

const initDB = () => {
  // 定義數據文件的路徑
  const initDataPath = './mock-server/initData/db.json';
  const dbPath = config[env].db.path;
  // 檢查初始數據文件是否存在
  if (fs.existsSync(initDataPath)) {
    // 複製初始數據文件到目標位置
    fs.copyFileSync(initDataPath, dbPath);
    console.log(`初始數據已成功複製到 ${config[env].db.name}。`);
  } else {
    console.error('找不到初始數據文件。請確保 initData/db.json 存在。');
    process.exit(1);
  }
};
initDB();

module.exports = { initDB };
