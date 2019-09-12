

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const assert = require('assert');

const getStub = sinon.stub();
const sendNotificationStub = sinon.stub();

const { getMovedOnDate } = proxyquire('../members', {
  axios: { get: getStub },
  utils: { sendNotification: sendNotificationStub }
});

const testData = {
  lastMonth: {
    addressUnknown: false,
    age: 42,
    genderLabelShort: 'F',
    moveDate: '11 Jan 2000',
    moveDateCalc: '2000-01-11',
    name: 'Man, Yo',
    address: 'Somewhere in Arizona',
  },
  thisMonth: {
    addressUnknown: false,
    age: 42,
    genderLabelShort: 'F',
    moveDate: '11 Feb 2000',
    moveDateCalc: '2000-02-11',
    name: 'Yo Man, Another',
    address: 'Somewhere else in Arizona',
  },
  date: new Date(2000, 1, 11)
};

const { expect } = require('chai');

describe('getMovedOnDate', () => {
  beforeEach(() => {
    getStub.resolves({ data: [] });
  });

  it('should make a get request with the cookie', async () => {
    try {
      await getMovedOnDate('myAuthCookie', 'myUrl', testData.date);
      expect(getStub).to.have.been.calledWith('myUrl', { headers: { cookie: 'myAuthCookie' } });
    } catch (error) {
      assert.fail(error);
    }
  });

  it('should throw an error when data is not an Array', async () => {
    getStub.resolves('hello');
    try {
      await getMovedOnDate('myAuthCookie', 'myUrl', testData.date);
      assert.fail();
    } catch (error) {
      expect(error.message).to.eq('Invalid data!');
    }
  });

  it('should filter out members without a move date of today', async () => {
    getStub.resolves({ data: [testData.lastMonth, testData.thisMonth] });
    try {
      const members = await getMovedOnDate('myAuthCookie', 'myUrl', testData.date);
      expect(members).to.have.lengthOf(1);
      expect(members).to.eqls([testData.thisMonth]);
    } catch (error) {
      assert.fail(error);
    }
  });

})