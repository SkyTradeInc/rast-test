const logger = require('./lib/components/Logger');
require('dotenv').config()

logger.info('Initiating service...')

process.title = 'Rast v0.1'

require('./lib/server.js')
