class ItemValidator {
  validate(item) {
    expect(item).toHaveProperty('item_id');
    expect(item).toHaveProperty('item_type');

    if (item.item_type === 0) {
      this.validateBrowserTabItem(item);
    } else if (item.item_type === 1) {
      this.validateNoteItem(item);
    } else if (item.item_type === 2) {
      this.validateDoneStatusItem(item);
    }
  }

  validateBrowserTabItem(item) {
    expect(item).toHaveProperty('browserTab_favIconURL');
    expect(item).toHaveProperty('browserTab_title');
    expect(item).toHaveProperty('browserTab_url');
    expect(item).toHaveProperty('browserTab_id');
    expect(item).toHaveProperty('browserTab_index');
    expect(item).toHaveProperty('browserTab_active');
    expect(item).toHaveProperty('browserTab_status');
    expect(item).toHaveProperty('windowId');
  }

  validateNoteItem(item) {
    expect(item).toHaveProperty('note_content');
    expect(item).toHaveProperty('note_bgColor');
  }

  validateDoneStatusItem(item) {
    expect(item).toHaveProperty('doneStatus');
    expect(item).toHaveProperty('note_content');
    expect(item).toHaveProperty('note_bgColor');
  }
}

module.exports = ItemValidator;
