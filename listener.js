// const log = require('debug')('app:server');
require('dotenv').config();
const app = require('./app');

const host = process.env.SERVER_HOST || 'localhost';
const port = process.env.SERVER_PORT || '3000';
app.set('port', port);

app.listen(port, () => {
  console.log(`Listening at http://${host}:${port}`);
});
