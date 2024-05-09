function groupsChanges(oldJson, newJson) {
  const changes = {
    addedItems: [],
    deletedItems: [],
  };

  // Convert JSON objects to Maps for easier comparison
  const oldGroupsMap = new Map(oldJson.map((group) => [group.group_id, group]));
  const newGroupsMap = new Map(newJson.map((group) => [group.group_id, group]));

  // Check for deleted items
  oldGroupsMap.forEach((oldGroup, groupId) => {
    if (!newGroupsMap.has(groupId)) {
      changes.deletedItems.push(oldGroup);
    } else {
      const oldItemsMap = new Map(oldGroup.items.map((item) => [item.item_id, item]));
      const newItemsMap = new Map(newGroupsMap.get(groupId).items.map((item) => [item.item_id, item]));

      const deletedItems = [];
      oldItemsMap.forEach((item, itemId) => {
        if (!newItemsMap.has(itemId)) {
          deletedItems.push(item);
        }
      });

      if (deletedItems.length > 0) {
        changes.deletedItems.push({
          ...oldGroup,
          items: deletedItems,
        });
      }
    }
  });

  // Check for added items
  newGroupsMap.forEach((newGroup, groupId) => {
    if (!oldGroupsMap.has(groupId)) {
      changes.addedItems.push(newGroup);
    } else {
      const oldItemsMap = new Map(oldGroupsMap.get(groupId).items.map((item) => [item.item_id, item]));
      const newItemsMap = new Map(newGroup.items.map((item) => [item.item_id, item]));

      const addedItems = [];
      newItemsMap.forEach((item, itemId) => {
        if (!oldItemsMap.has(itemId)) {
          addedItems.push(item);
        }
      });

      if (addedItems.length > 0) {
        changes.addedItems.push({
          ...newGroup,
          items: addedItems,
        });
      }
    }
  });

  return changes;
}

module.exports = { groupsChanges };
