const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


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
  res.redirect(`/urls/${shortUrl}`);  //Redirect Short URLs   
});

//Redirect long URLs //promenila sam urls!!
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get ("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase, // need to be object
    username: req.cookies["username"]  //*
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"] //*
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"] //*
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

//THE LOGIN ROUTE
app.post("/login", (req, res) => {
  const username = req.body["username"]
  res.cookie("username", username)
  res.redirect("/urls");
});

//THE LOGOUT ROUTE
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
})
// const templateVars = {
//   username: req.cookies["username"],
//   // ... any other vars
// };
// res.render("urls_index", templateVars);

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listeniong on port ${PORT}!`);
});

