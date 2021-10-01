const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "bsJ75l": {
    id: "bsJ75l", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    assert.equal(user, testUsers.aJ48lW); 
  });
  it('should return undefined if email is not in our users database', function() {
    const user = findUserByEmail("user4@example.com", testUsers);
    assert.equal(user, undefined); 
  })
});