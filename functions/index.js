const functions = require('firebase-functions');
require('dotenv').config();

const { slackIntegration } = require('./slackIntegration');

module.exports = {
  slackIntegration: functions.pubsub.schedule('every day 09:00').onRun(slackIntegration)
};
