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
   * @param {Object} browserTabData
   */
  constructor(browserTabData) {
    super(); // 調用父類的構造函數
    this.item_type = 0;
    this.browserTab_favIconURL = browserTabData.browserTab_favIconURL;
    this.browserTab_title = browserTabData.browserTab_title;
    this.browserTab_url = browserTabData.browserTab_url;
    this.browserTab_id = browserTabData.browserTab_id;
    this.browserTab_index = browserTabData.browserTab_index;
    this.browserTab_active = browserTabData.browserTab_active;
    this.browserTab_status = browserTabData.browserTab_status;
    this.windowId = browserTabData.windowId;
  }
}

module.exports = {
  Tab,
};
