require('dotenv').config();

const { API_VERSION } = process.env;

const swaggerUi = require('swagger-ui-express');
const config = require('../../configs/config.json');

const env = process.env.NODE_ENV || 'development';
const { host, port } = config[env].app;

function setupSwagger(server) {
  const { name, version, description } = require('../../package.json');

  // // Use Jsdoc
  // const swaggerFile = require('swagger-jsdoc');
  // const options = {
  //   swaggerDefinition: {
  //     openapi: '3.0.0',
  //     info: {
  //       title: `${name}`,
  //       version: `${version}`,
  //       description: `${description}`,
  //     },
  //     // FIXME - 不同版本api在此設定切換
  //     servers: [
  //       {
  //         url: `http://${host}:${port}/api/${API_VERSION}`,
  //       },
  //     ],
  //     tags: [
  //       {
  //         name: 'Groups',
  //         description: 'Operations related to groups management',
  //       },
  //       {
  //         name: 'Items(Spec)',
  //         description: 'Specific operations related to items management',
  //       },
  //       {
  //         name: 'Items',
  //         description: 'General operations related to items management',
  //       },
  //     ],
  //   },
  //   apis: [
  //     './routes/*.js',
  //     './routes/modules/*.js',
  //     './controllers/*.js',
  //     './models/*/*.js',
  //   ], // files containing annotations as above
  // };
  // const swaggerSpec = swaggerFile(options);

  // Read Swagger YAML
  const fs = require('fs');
  const yaml = require('js-yaml');
  const path = require('path');
  const spec = fs.readFileSync(path.resolve(__dirname, '../data/swagger_output_jsdoc.yml'));
  const swaggerSpec = yaml.load(spec);

  // FIXME - api-doc不用前綴。不然請求會重複路徑
  server.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  return server;
}

module.exports = {
  setupSwagger,
};
