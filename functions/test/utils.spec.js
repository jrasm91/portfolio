
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const assert = require('assert');

const postStub = sinon.stub();

const {
  loginAndGetCookie,
  objectToFormData,
  formatDate
} = proxyquire('../utils', { axios: { post: postStub } });

const { expect } = require('chai');

const loginParams = {
  url: 'myUrl',
  username: 'foo',
  password: 'bar',
  re: /myCookie/
};

describe('objectToFormData', () => {
  it('should join with &', async () => {
    const results = objectToFormData({
      username: 'foo',
      password: 'bar'
    });
    expect(results).to.equal('username=foo&password=bar');
  });

  it('should escape @', async () => {
    const result = objectToFormData({
      username: 'foo',
      password: 'b@r'
    });
    expect(result).to.equal('username=foo&password=b%40r');
  });
});

describe('loginAndGetCookie', () => {
  beforeEach(() => {
    postStub.resolves({
      headers: {
        'set-cookie': ['myCookie=myAuthCookie;domain;extra']
      }
    });
  });

  it('should send a post', async () => {
    await loginAndGetCookie({
      url: 'myUrl',
      username: 'foo',
      password: 'bar',
      re: /myCookie/
    });
    expect(postStub).to.have.been.calledWith('myUrl', 'username=foo&password=bar');
  });

  it('should return the cookie', async () => {
    const cookie = await loginAndGetCookie(loginParams);
    expect(cookie).to.equal('myCookie=myAuthCookie');
  });

  describe('when there is no cookie', () => {
    beforeEach(() => {
      postStub.resolves({ headers: {}, status: 200 })
    });

    it('should thrown an error', async () => {
      try {
        await loginAndGetCookie(loginParams);
        assert.fail();
      } catch (error) {
        expect(error.message).to.equal('Unable to get auth cookie: No cookie matched regex')
      }
    });
  });

  describe('when the post request fails', () => {
    beforeEach(() => {
      postStub.rejects({ headers: {}, status: 500, message: 'Service Unavailable' })
    });

    it('should thrown an error', async () => {
      try {
        await loginAndGetCookie(loginParams);
        assert.fail();
      } catch (error) {
        expect(error.message).to.equal('Unable to get auth cookie: Service Unavailable')
      }
    });
  })
});

describe('formatDate', () => {
  it('should work with a string', () => {
    const result = formatDate('2019-01-01');
    expect(result).to.equal('2019-01-01');
  });

  it('should work with a date', () => {
    const result = formatDate(new Date(2019, 09, 12));
    expect(result).to.equal('2019-10-12');
  });

  it('should pad month with 0', () => {
    const result = formatDate('2019-1-23');
    expect(result).to.equal('2019-01-23');
  });

  it('should pad day with 0', () => {
    const result = formatDate('2019-01-1');
    expect(result).to.equal('2019-01-01');
  });
});