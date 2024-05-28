function checkUUIDv4Format(value) {
    expect(value).toMatch(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[4][0-9a-fA-F]{3}\b-[89abAB][0-9a-fA-F]{3}\b-[0-9a-fA-F]{12}$/);
}

module.exports = { checkUUIDv4Format };
