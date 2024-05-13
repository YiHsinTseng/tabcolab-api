class GroupValidator {
  constructor(itemValidator) {
    this.itemValidator = itemValidator;
  }

  validate(group) {
    expect(typeof group).toBe('object');
    expect(group).toHaveProperty('group_id');
    expect(group).toHaveProperty('group_icon');
    expect(group).toHaveProperty('group_title');
    expect(Array.isArray(group.items)).toBe(true);

    group.items.forEach((item) => {
      this.itemValidator.validate(item);
    });
  }
}

module.exports = GroupValidator;
