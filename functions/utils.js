const { post } = require('axios');

const objectToFormData = obj => {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
};

const loginAndGetCookie = async ({ url, username, password, re }) => {
  try {
    const response = await post(url, objectToFormData({ username, password }));
    const [authCookie] = (response.headers['set-cookie'] || []).filter(cookie => re.test(cookie));
    if (!authCookie) {
      throw new Error('No cookie matched regex');
    }
    return authCookie.split(';')[0];
  } catch (error) {
    throw new Error(`Unable to get auth cookie: ${error.message}`);
  }
}

const formatDate = date => {
  if (typeof date === 'string') {
    date = new Date(date);
    date.setTime(date.getTime() + (7 * 60 * 60 * 1000));
  }
  const yyyy = date.getFullYear();
  let mm = (date.getMonth() + 1) + '';
  let dd = date.getDate() + '';
  mm = mm.length === 1 ? '0' + mm : mm;
  dd = dd.length === 1 ? '0' + dd : dd;

  return `${yyyy}-${mm}-${dd}`;
}


module.exports = {
  loginAndGetCookie,
  objectToFormData,
  formatDate
};
