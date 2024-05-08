function groupsChanges(oldJson, newJson) {
  const changes = {
    addedItems: [],
    deletedItems: [],
  };

  const oldGroupsMap = new Map(Object.entries(oldJson));
  const newGroupsMap = new Map(Object.entries(newJson));

  // 尋找被刪除的 items
  oldGroupsMap.forEach((oldGroup, groupId) => {
    const newGroup = newGroupsMap.get(groupId);
    if (!newGroup) {
      changes.deletedItems.push({
        ...oldGroup,
        items: Array.isArray(oldGroup.items) ? oldGroup.items : [],
      });
    } else {
      const deletedItemsInGroup = Array.isArray(oldGroup.items) ? oldGroup.items.filter((oldItem) => !newGroup.items.some((newItem) => newItem.item_id === oldItem.item_id)) : [];
      if (deletedItemsInGroup.length > 0) {
        changes.deletedItems.push({
          ...oldGroup,
          items: deletedItemsInGroup,
        });
      }
    }
  });

  // 尋找新增的 items
  newGroupsMap.forEach((newGroup, groupId) => {
    const oldGroup = oldGroupsMap.get(groupId);
    if (!oldGroup) {
      changes.addedItems.push({
        ...newGroup,
        items: Array.isArray(newGroup.items) ? newGroup.items : [],
      });
    } else {
      const addedItemsInGroup = Array.isArray(newGroup.items) ? newGroup.items.filter((newItem) => !oldGroup.items.some((oldItem) => oldItem.item_id === newItem.item_id)) : [];
      if (addedItemsInGroup.length > 0) {
        changes.addedItems.push({
          ...newGroup,
          items: addedItemsInGroup,
        });
      }
    }
  });

  return changes;
}

module.exports = { groupsChanges };
