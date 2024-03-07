// const log = require('debug')('app:server');
require('dotenv').config();
const config = require('./configs/config.json');

const env = process.env.NODE_ENV || 'development';
const app = require(config[env].app.path);
const { host, port } = config[env].app;

// const app = require('./app');

// const host = process.env.SERVER_HOST || 'localhost';
// const port = process.env.SERVER_PORT || '3000';
// app.set('port', port);

app.listen(port, () => {
  console.log(`Listening at http://${host}:${port}`);
});
