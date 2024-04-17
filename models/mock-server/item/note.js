const { Item } = require('.');

class Note extends Item {
  constructor(item_id, note_content, note_bgColor) {
    super(item_id, 1, note_bgColor);
    this.note_content = note_content;
  }
}
