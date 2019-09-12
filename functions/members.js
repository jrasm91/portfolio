
const { get } = require('axios');
const { formatDate } = require('./utils');

const getMovedOnDate = async (authCookie, url, movedDate) => {
  const { data: members } = await get(url, { headers: { cookie: authCookie } });
  if (!Array.isArray(members)) {
    throw new Error('Invalid data!');
  }

  return members.filter(member => {
    return formatDate(member.moveDateCalc || member.moveDate) === formatDate(movedDate);
  });
}

module.exports = { getMovedOnDate };
