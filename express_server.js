const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
// const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
// app.use(cookieSession({}));
app.set("view engine", "ejs");
const saltRound = 10;
const bcrypt = require('bcryptjs');
const password1 = "purple-monkey-dinosaur"; // found in the req.params object
const password2 = "dishwasher-funk"; // found in the req.params object
const hashedPassword1 = bcrypt.hashSync(password1, saltRound);
const hashedPassword2 = bcrypt.hashSync(password2, saltRound);


const users = { 
  "uaJ48lW": {
    id: "uaJ48lW", 
    email: "user@example.com", 
    password: hashedPassword1
  },
 "bsJ75lG": {
    id: "bsJ75lG", 
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


//CREATE

function generateRandomString() {
  const randomString = Math.random().toString(36).substr(2, 6);
  return randomString;
};

app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString(); 
  // console.log(urlDatabase[shortUrl]); 
  urlDatabase[shortUrl] = {longURL: req.body.longURL, userID: req.cookies['user_id']};
  res.redirect("/urls");  //Redirect Short URLs   
}); 

//Redirect long URLs 
app.get("/u/:shortURL", (req, res) => {
  if(!urlDatabase[req.params.shortURL]) {
    res.status(400).send("ShortURL doesn't exist");
    return;
  }
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL; 
  // console.log(longURL) -> redirect from shortUrl to web page (longURL) - works 
  res.redirect(longURL);
  
});

app.get ("/urls", (req, res) => {
  const user = urlsForUser (req.cookies['user_id'])
  if (!req.cookies['user_id']) {
    res.redirect("/login")
  } 
  const templateVars = {
    urls: user, // need to be object
    user: users[req.cookies['user_id']] 
  };
  // console.log(req.cookies['user_id'])

  
  // console.log(urlDatabase)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']] 
  }
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
  
});

app.get("/urls/:shortURL", (req, res) => { //*changed
  if (urlDatabase[req.params.shortURL].userID !== req.cookies['user_id']) {
    res.status(403).send("You don't have permission to access this URL");
    return;
  }
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,//*changed
    user: users[req.cookies['user_id']] 
  };
  res.render("urls_show", templateVars);

});

//UPDATE 

app.post("/urls/:shortURL", (req, res) => {
  const shortUrlId = req.params.shortURL;
  const urlConted = req.body.urlConted;
  urlDatabase[shortUrlId].longURL = urlConted;
  res.redirect("/urls")
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[req.params.shortURL].userID !== req.cookies['user_id']) {
    res.status(403).send("You don't have permission to access this URL");
    return;
  }
  const longURL = req.body.longURL;
  // console.log(longURL) -> for submit new longURL
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
});


//DELETE

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[req.params.shortURL].userID !== req.cookies['user_id']) {
    res.status(403).send("You don't have permission to access this URL");
    return;
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//FUNCTION HELPERS

const createUser = function (email, password, users) {
  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, saltRound);
   users[userId] = {
    id: userId,
    email,
    hashedPassword
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

  if (userFound && bcrypt.compareSync(password, userFound.password)){  //password match = log in
    return userFound;
  }

  return false;
};


const urlsForUser = function (ID) {
  let userUrls = {};
  for (let key in urlDatabase) { 
    // console.log(urlDatabase[key].userID);
    if(urlDatabase[key].userID === ID) {
      userUrls[key] = urlDatabase[key]
      
    }
  } return userUrls
  // return URLs 
  // when the userID = id of logedinpersond
}

// console.log(urlsForUser("aJ48lW"))



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

