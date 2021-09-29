const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


const users = { 
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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//CREATE

function generateRandomString() {
  const randomString = Math.random().toString(36).substr(2, 6);
  return randomString;
};

app.post("/urls", (req, res) => {
  // console.log(req.body); 
  const shortUrl = generateRandomString(); 
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect("/urls");  //Redirect Short URLs   
});

//Redirect long URLs 
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get ("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase, // need to be object
    user: users[req.cookies['user_id']] 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']] 
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies['user_id']] 
  };
  res.render("urls_show", templateVars);
});

//UPDATE 

app.post("/urls/:shortURL", (req, res) => {
  const shortUrlId = req.params.shortURL;
  const urlConted = req.body.urlConted;
  urlDatabase[shortUrlId] = urlConted;
  res.redirect("/urls")
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

//DELETE

app.post("/urls/:shortURL/delete", (req, res) => {
  const urlDeleted = req.params.shortURL;
  delete urlDatabase[urlDeleted];
  res.redirect("/urls");
});

//FUNCTION HELPERS

const createUser = function (email, password, users) {
  const userId = generateRandomString();
   users[userId] = {
    id: userId,
    email,
    password,
  };

  return userId;
};

const findUserByEmail = function (email, users) {
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      return user;
    }
  }

  return false;
};

const authenticateUser = function (email, password, users) {
  
  const userFound = findUserByEmail(email, users);

  if (userFound && userFound.password === password) { //password match = log in
    return userFound;
  }

  return false;
};

//THE LOGIN ROUTE
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = authenticateUser(email, password, users);

  if(user) {
    res.cookie('user_id', user.id); //if user is authenticated = create a cookie
    res.redirect("/urls"); // and redirect user to the /urls
    return;
  } else {
    res.status(403).send("You don't have permission to access / on this server");
  }
  
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']] 
  }
  res.render("urls_login", templateVars)
});

//THE REGISTER ROUTE
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']] 
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
  res.cookie('user_id', userId);
  //console.log(users);

  res.redirect("/urls");
});


//THE LOGOUT ROUTE
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listeniong on port ${PORT}!`);
});

