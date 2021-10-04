const express = require("express");
const app = express();
const PORT = 8080;
const { findUserByEmail, generateRandomString, urlsForUser, createUser, authenticateUser, setUpUsers, urlDatabase } = require('./helpers');

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


// function that calls users object database (users information including id, email, password)
const users = setUpUsers();


// Redirects to url main page if the user is logged in otherwise redirects to login.
app.get("/", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  }
  res.redirect("/login");
});

// Renders the user's shortURL / longURL if the user is logged in otherwise sends 403 message.
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

// Renders the user's new shortURL if the user is logged in otherwise redirects to login.
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

// Renders the user's shortURL if the user is logged in otherwise sends 403/400 message.
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

// Sends a 400 message if the shortURL doesn't exist otherwise redirect to the website (longURL)
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400).send("ShortURL doesn't exist");
    return;
  }
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  
  res.redirect(longURL);
});

// Adds new url to database if the user is logged in otherwise sends 403 message.
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

// Allows users to edit url if the user is logged in otherwise sends 403 message.
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

// Allows user to delete urls if the user is logged in otherwise sends 403 message.
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.status(403).send("You don't have permission to access this URL");
    return;
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// THE LOGIN ROUTE - Allows users to login if the email is correct
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

// Renders the login page
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

// THE REGISTER ROUTE - Renders the registeration page
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

// Allows new users to register
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

// THE LOGOUT ROUTE - Allows new users to logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listeniong on port ${PORT}!`);
});

