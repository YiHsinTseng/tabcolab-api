// const config = require('../configs/config.json');

// const env = process.env.NODE_ENV || 'development';
// const db_path = `../${config[env].db.db_path}`;
// const db = require(db_path);
const { generateItemId } = require('../utils/generateId');

class Item {
  constructor() {
    this.item_id = generateItemId();
  }
}

class Tab extends Item {
  /**
   * @param {string} browserTab_favIconURL
   * @param {string} browserTab_title
   * @param {string} browserTab_url
   */
  constructor(browserTab_favIconURL, browserTab_title, browserTab_url) {
    super(); // 調用父類的構造函數
    this.item_type = 0;
    this.browserTab_favIconURL = browserTab_favIconURL;
    this.browserTab_title = browserTab_title;
    this.browserTab_url = browserTab_url;
  }
}

module.exports = {
  Tab,
};
