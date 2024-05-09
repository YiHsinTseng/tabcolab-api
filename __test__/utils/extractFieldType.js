const extractFieldType = (Data) => {
  const typeChecks = {
    string: [],
    number: [],
    boolean: [],
  };

  Object.entries(Data).forEach(([key, value]) => {
    const type = typeof value;
    if (typeChecks[type]) {
      typeChecks[type].push(key);
    }
  });

  // 移除沒有任何屬性的類型
  Object.keys(typeChecks).forEach((type) => {
    if (typeChecks[type].length === 0) {
      delete typeChecks[type];
    }
  });

  return typeChecks;
};

module.exports = { extractFieldType };
