const { Item } = require('../item');

class Todo extends Item {
  constructor(item_id, doneStatus, note_bgColor) {
    super(item_id, 2, note_bgColor);
    this.doneStatus = doneStatus;
  }
}
