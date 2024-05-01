require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
// Read Swagger YAML
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

function setupSwagger(server) {
  const spec = fs.readFileSync(path.resolve(__dirname, '../data/swagger_output.yml'));
  const swaggerSpec = yaml.load(spec);

  server.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  return server;
}

module.exports = {
  setupSwagger,
};
