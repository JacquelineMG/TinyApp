// Server Setup and Middleware:
const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const morgan = require("morgan");
app.use(morgan('dev'));

const crypto = require("crypto");
const { url } = require("inspector");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Helper Functions:
// Random code generator:
const generateRandomString = function() {
  const id = crypto.randomBytes(3).toString('hex');
  return id
};


// Database:
const urlDatabase = {
  // id === short URL codes
  // urls[id] === long urls
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//CREATE: show create new URL

//SAVE: submit new URL

//LOGIN 
app.post("/login", (req, res) => {
  const cookie = req.body.username;
  res.cookie("username", cookie);
  res.redirect("/urls");
});


//INDEX: display all URLS
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
 };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});

//SAVE: Submit new URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"] 
  };
  res.render("urls_show", templateVars);
});


//UPDATE: Submit edited URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL
  res.redirect("/urls");
});


app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


app. get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//Listener:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});