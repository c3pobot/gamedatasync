const log = require('./src/logger')
let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel(logLevel);
process.on('unhandledRejection', (error) => {
  log.error(error)
});
global.baseDir = __dirname
require('./src')
