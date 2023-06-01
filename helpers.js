///////////////////////////////
// TINYAPP HELPER FUNCTIONS: //
///////////////////////////////


// Random code generator:
const crypto = require("crypto");

const generateRandomString = function() {
  const id = crypto.randomBytes(3).toString('hex');
  return id;
};


// Email lookup:
//database = users

const findUserByEmail = function(newEmail, database) {
  for (const userKey in database) {
    if (database[userKey].email === newEmail) {
      return database[userKey];
    }
  } return null;
};


// ID lookup:
//database = urlDatabase

const findUserID = function(newID, database) {
  for (const key in database) {
    if (key === newID) {
      return true;
    }
  } return false;
};


// Build user's individual URLS database:
//database = urlDatabase

const getUserURLS = function(usersID, database) {
  const userURLS = {};
  for (const key in database) {
    if (database[key].userID === usersID) {
      userURLS[key] = {
        longURL: database[key].longURL,
        userID: database[key].userID
      };
    }
  } return userURLS;
};



module.exports = {
  generateRandomString,
  findUserByEmail,
  findUserID,
  getUserURLS
};