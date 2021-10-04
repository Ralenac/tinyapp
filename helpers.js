const bcrypt = require('bcryptjs');
const saltRound = 10;

const setUpUsers = () => {
  const password1 = "purple-monkey-dinosaur";
  const password2 = "dishwasher-funk";
  const hashedPassword1 = bcrypt.hashSync(password1, saltRound);
  const hashedPassword2 = bcrypt.hashSync(password2, saltRound);
  
  return {
    "aJ48lW": {
      id: "aJ48lW",
      email: "user@example.com",
      password: hashedPassword1
    },
    "bsJ75l": {
      id: "bsJ75l",
      email: "user2@example.com",
      password: hashedPassword2
    }
  };
};

// database having shortURL, longURL and userID
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  s9sm5xK: {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
};


const findUserByEmail = function(email, users) {
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      return user;
    }
  }
  return undefined;
};


// Return the user object which match the email address
const generateRandomString = function() {
  const randomString = Math.random().toString(36).substr(2, 6);
  return randomString;
};


// Return an object of URLs with same userID as the user
const urlsForUser = function(ID) {
 
  let userUrls = {};
  for (let key in urlDatabase) {
   
    if (urlDatabase[key].userID === ID) {
      userUrls[key] = urlDatabase[key];
    }
  } return userUrls;
};


const createUser = function(email, password, users) {
  const hashedPassword = bcrypt.hashSync(password, saltRound);
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email,
    password: hashedPassword
  };
  return userId;
};

const authenticateUser = function(email, password, users) {
  const userFound = findUserByEmail(email, users);
  if (userFound && bcrypt.compareSync(password, userFound.password)) {
    return userFound;
  } else {
    return false;
  }
};

module.exports = { findUserByEmail, generateRandomString, urlsForUser, createUser, authenticateUser, setUpUsers, urlDatabase };

