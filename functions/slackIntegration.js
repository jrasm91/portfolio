const { post } = require('axios');
const { getMovedOnDate } = require('./members');
const { formatDate, loginAndGetCookie } = require('./utils');

const UNIT_NUMBER = process.env.WARD_UNIT;
const MOVE_IN_URL = `https://lcr.churchofjesuschrist.org/services/report/members-moved-in/unit/${UNIT_NUMBER}/1?lang=eng`
const MOVE_OUT_URL = `https://lcr.churchofjesuschrist.org/services/umlu/report/members-moved-out/unit/${UNIT_NUMBER}/1?lang=eng`

const AUTH_URL = `https://signin.lds.org/login.html`;
const SLACK_CHANNEL = process.env.SLACK_WEBHOOK;

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const makeMovedMessage = member => {
  const genderEmoji = member.genderLabelShort === 'F' ? ':woman:' : ':man:';
  const addressEmoji = member.addressUnknown ? ':exclamation:' : ''
  return `${genderEmoji} ${member.name} (${member.age || member.nextUnitName}) ${addressEmoji}`
}

const checkForMoveIns = async (authCookie) => {
  const newMembers = await getMovedOnDate(authCookie, MOVE_IN_URL, yesterday);

  if (newMembers.length > 0) {
    const title = `:tada: ${newMembers.length} Member${newMembers.length >= 1 ? 's' : ''}! :tada:`;
    const body = newMembers.map(member => makeMovedMessage(member)).join('\n')
    await post(SLACK_CHANNEL, { text: `${title}\n\n${body}` });
  } else {
    console.info(`No members moved-in on ${formatDate(yesterday)}.`);
  }
}

const checkForMoveOuts = async (authCookie) => {
  const oldMembers = await getMovedOnDate(authCookie, MOVE_OUT_URL, yesterday);

  if (oldMembers.length > 0) {
    const title = `:tada: ${oldMembers.length} Member${oldMembers.length >= 1 ? 's' : ''} Moved Out! :tada:`;
    const body = oldMembers.map(member => makeMovedMessage(member)).join('\n')
    await post(SLACK_CHANNEL, { text: `${title}\n\n${body}` });
  } else {
    console.info(`No members moved-out on ${formatDate(yesterday)}.`);
  }
}

const slackIntegration = async () => {
  try {
    const authCookie = await loginAndGetCookie({
      url: AUTH_URL,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      re: /ObSSOCookie=/i
    });

    await checkForMoveIns(authCookie).catch(error => {
      console.error(`Error checking for move-ins: ${error.message}`);
    });

    await checkForMoveOuts(authCookie, MOVE_OUT_URL).catch(error => {
      console.error(`Error checking for move-outs: ${error.message}`);
    });

  } catch (error) {
    console.error(`Error getting AuthCookie ${error.message}`);
  }
}

module.exports = { slackIntegration };



