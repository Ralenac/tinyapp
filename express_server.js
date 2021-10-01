const express = require("express");
const app = express();
const PORT = 8080;
const {findUserByEmail} = require("./helpers.js");

const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  keys: ['b7^TSQp*%s}5sUTG', '[sPQvc7/8%"?{fZs']
}));

app.set("view engine", "ejs");
const saltRound = 10;
const bcrypt = require('bcryptjs');
const password1 = "purple-monkey-dinosaur"; // found in the req.params object
const password2 = "dishwasher-funk"; // found in the req.params object
const hashedPassword1 = bcrypt.hashSync(password1, saltRound);
const hashedPassword2 = bcrypt.hashSync(password2, saltRound);


const users = {
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



app.get("/", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  }
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const user = urlsForUser(req.session.user_id);
  if (!req.session.user_id) {
    res.status(403).send("You don't have permission to access this app! You should login / register first.");
    return;
  }
  const templateVars = {
    urls: user,
    user: users[req.session.user_id]
  };
 
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!users[req.session.user_id]) {
    res.status(403).send("You don't have permission to access this URL");
    return;
  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.status(403).send("You don't have permission to access this URL");
    return;
  }
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400).send("ShortURL doesn't exist");
    return;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);

});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400).send("ShortURL doesn't exist");
    return;
  }
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  
  res.redirect(longURL);
  
});


//CREATE 

const generateRandomString = function() {
  const randomString = Math.random().toString(36).substr(2, 6);
  return randomString;
};

app.post("/urls", (req, res) => {
  if (!users[req.session.user_id]) {
    res.status(403).send("You don't have permission to access this URL");
    return;
  }
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {longURL: req.body.longURL, userID: req.session.user_id};

  res.redirect("/urls");
});

// THE UPDATE /EDIT ROUTE

app.post("/urls/:shortURL", (req, res) => {
  if (!users[req.session.user_id]) {
    res.status(403).send("You don't have permission to access this URL");
    return;
  }
  const shortUrlId = req.params.shortURL;
  const urlConted = req.body.urlConted;
  urlDatabase[shortUrlId].longURL = urlConted;

  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.status(403).send("You don't have permission to access this URL");
    return;
  }
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;

  res.redirect("/urls");
});


// THE DELETE ROUTE

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.status(403).send("You don't have permission to access this URL");
    return;
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// FUNCTION HELPERS

const createUser = function(email, password, users) {
  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, saltRound);
  users[userId] = {
    id: userId,
    email,
    hashedPassword
  };
  return userId;
};

const authenticateUser = function(email, password, users) {
  const userFound = findUserByEmail(email, users);
  if (userFound && bcrypt.compareSync(password, userFound["password"])) {
    return userFound;
  }
  return false;
};

const urlsForUser = function(ID) {
  let userUrls = {};
  for (let key in urlDatabase) {
   
    if (urlDatabase[key].userID === ID) {
      userUrls[key] = urlDatabase[key];
    }
  } return userUrls;
};


// THE LOGIN ROUTE

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = authenticateUser(email, password, users);

  if (user) {
    req.session.user_id = user.id;
    res.redirect("/urls");
    return;
  } else {
    res.status(403).send("You don't have permission to access / on this server");
  }
  
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (users[req.session.user_id]) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_login", templateVars);
});

// THE REGISTER ROUTE

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (templateVars.user) {
    res.redirect("/urls");
    return;
  }
    res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const userFound = findUserByEmail(email, users);
  if (email === "") {
    res.status(400).send("Invalid Email Address!");
    return;
  } else if (userFound) {
    res.status(400).send("User already exists!");
    return;
  }
  
  const userId = createUser(email, password, users);
  req.session.user_id = userId;

  res.redirect("/urls");
});

// THE LOGOUT ROUTE

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listeniong on port ${PORT}!`);
});

