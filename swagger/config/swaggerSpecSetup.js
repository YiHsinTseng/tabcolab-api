// Read Swagger YAML
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const spec = fs.readFileSync(path.resolve(__dirname, '../data/swagger_output.yml'));
const swaggerSpec = yaml.load(spec);

module.exports = swaggerSpec;
