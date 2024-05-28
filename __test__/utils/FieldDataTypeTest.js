const testValues = {
  string: 'test_value',
  number: 123,
  boolean: true,
};

function getTestValueByType(type) {
  const filteredValues = Object.entries(testValues).filter(([key, value]) => key !== type);
  return Object.fromEntries(filteredValues);
}

module.exports = { testValues, getTestValueByType };
