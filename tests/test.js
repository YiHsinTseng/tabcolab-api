const config = require('../configs/config.json');

const env = process.env.NODE_ENV || 'test';
const app = require(`.${config[env].app.path}`);
console.log(config[env].app.path);

const errorTest = require('./http.errorTest');
// const groupsTest = require('./http.groupsTest');

errorTest(app);
// groupsTest(app);
