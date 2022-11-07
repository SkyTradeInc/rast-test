const mongoose = require('mongoose');
const logger = require('./Logger')

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true, }, (error) => {
  if(!error) return;
  logger.error('Connection to MongoDB unsuccessful')
})

const db = mongoose.connection

db.on('connected', () => {
  logger.info('Connected to MongoDB')
});
