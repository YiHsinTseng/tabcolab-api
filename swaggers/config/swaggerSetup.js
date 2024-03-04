require('dotenv').config();

const { SERVER_PORT, API_VERSION } = process.env;
const swaggerUi = require('swagger-ui-express');


function setupSwagger(server) {
  const fs = require('fs')
  const yaml = require('js-yaml');
  const path = require('path');
  const spec = fs.readFileSync(path.resolve(__dirname, '../swagger.yml'));
  const swaggerSpec = yaml.load(spec);

  server.use(`/${API_VERSION}/api-doc`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  server.get('/', (req, res) => {
    res.redirect(`/${API_VERSION}/api-doc`);
  });

  return server;
}

module.exports = {
  setupSwagger,
};
