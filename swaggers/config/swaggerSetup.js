require('dotenv').config();

const { SERVER_PORT, API_VERSION } = process.env;
const swaggerUi = require('swagger-ui-express');


function setupSwagger(server) {

  const { name, version, description } = require('../../package.json');

  // Use Jsdoc
  const swaggerFile = require('swagger-jsdoc');
  const options = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: `${name}`,
        version: `${version}`,
        description: `${description}`,
      },
      servers: [
        {
          url: `http://localhost:${SERVER_PORT}`,
        },
      ],
      tags: [
        {
          name: 'Groups',
          description: 'Operations related to groups management',
        },
        {
          name: 'Items(Spec)',
          description: 'Specific operations related to items management',
        },
        {
          name: 'Items',
          description: 'General operations related to items management',
        },
      ],
    },
    apis: [
      './routes/*.js',
      './routes/modules/*.js',
      './controllers/*.js',
      './models/*.js',
    ], // files containing annotations as above
  };
  const swaggerSpec = swaggerFile(options);

  // Read Swagger YAML
  // const fs = require('fs')
  // const yaml = require('js-yaml');
  // const path = require('path');
  // const spec = fs.readFileSync(path.resolve(__dirname, '../swagger.yml'));
  // const swaggerSpec = yaml.load(spec);
  
  server.use(`/${API_VERSION}/api-doc`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  server.get('/', (req, res) => {
    res.redirect(`/${API_VERSION}/api-doc`);
  });
  

  return server;
}

module.exports = {
  setupSwagger,
};
