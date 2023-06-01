//////////////////////////////////////////
// TINYAPP TESTING WITH MOCHA AND CHAI: //
//////////////////////////////////////////


const { assert } = require('chai');

const { findUserByEmail, findUserID, getUserURLS } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testURLDatabase = {
  b2xVn1: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "abc123",
  },
  "8sm5xK": {
    longURL: "http://www.google.com",
    userID: "abc123",
  },
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "def456",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "def456",
  },
};


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = testUsers.userRandomID;
    assert.deepEqual(user, expectedUserID);
  });

  it('should return null', function() {
    const user = findUserByEmail("notauser@example.com", testUsers);
    const expectedUserID = null;
    assert.deepEqual(user, expectedUserID);
  });
});

describe('findUserID', function() {
  it('should return true if user ID found in database', function() {
    const userID = findUserID("b2xVn1", testURLDatabase);
    assert.equal(userID, true);
  });

  it('should return false if user ID not found in database', function() {
    const userID = findUserID("b2xVj1", testURLDatabase);
    assert.equal(userID, false);
  });
});

describe('getUserURLS', function() {
  it('should return an object of URLs and ID that correspond with user ID', function() {
    const userURLS = getUserURLS("abc123", testURLDatabase);
    const urlObject = {
      b2xVn1: { longURL: 'http://www.lighthouselabs.ca', userID: 'abc123' },
      '8sm5xK': { longURL: 'http://www.google.com', userID: 'abc123' }
    };
    assert.deepEqual(userURLS, urlObject);
  });

  it('should return an empty object if user ID not found in database', function() {
    const userURLS = getUserURLS("notthere", testURLDatabase);
    const urlObject = {};
    assert.deepEqual(userURLS, urlObject);
  });
});