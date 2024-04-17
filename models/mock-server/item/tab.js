const { Item } = require('../item');

class Tab extends Item {
  constructor(item_id, browserTab_favIconURL, browserTab_title, browserTab_url, note_bgColor) {
    super(item_id, 0, browserTab_favIconURL, browserTab_title, browserTab_url, note_bgColor);
  }

  addTabNote(note_content) {
    this.note_content = note_content;
  }

  updateTabNote(note_content) {
    this.note_content = note_content;
  }
}
