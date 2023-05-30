// Project Description: A full stack web app built with Node and Express that allows users to shorten long URLs

// Server Setup and Middleware:
const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const morgan = require("morgan");
app.use(morgan('dev'));

const crypto = require("crypto");
 
const cookieParser = require("cookie-parser");
app.use(cookieParser());


//Listener:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// ID Database:
const urlDatabase = {
  // id === short URL codes
  // urls[id] === long urls
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// User Database:
const users = {
  abc123: {
    id: "abc123",
    email: "a@a.com",
    password: "123"
  },
  def456: {
    id: "def456",
    email: "d@d.com",
    password: "456"
  }
};

// Helper Functions:

// Random code generator:

const generateRandomString = function() {
  const id = crypto.randomBytes(3).toString('hex');
  return id;
};

// Email lookup:

const findUserByEmail = function (newEmail) {
  for (const user in users) {
    if (users[user].email === newEmail) {
      return users[user];
    }
  } return null;
};




////////////////////////
////////  GETS  ////////
////////////////////////


// Registration page:

app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];

  const templateVars = {
    user
  }
  res.render("urls_register", templateVars);
});


// Login page:

app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];

  const templateVars = {
    user
  };
res.render("urls_login",  templateVars)
});


// Display all URLS page:

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];

  const templateVars = {
    urls: urlDatabase,
    user
  };
  res.render("urls_index", templateVars);
});


// Create new URL page:

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];

  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});


// Individual shortened URL page:

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user
  };
  res.render("urls_show", templateVars);
});


// Individual redirect links page:

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


// Json:

app. get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// Test/temp pages: 

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



////////////////////////
////////  POSTS  ///////
////////////////////////


// Registration process:

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === "" || password === "") {
    return res.status(400).send("Please fill in all the requested fields.");
  };

  if (findUserByEmail(email)) {
    return res.status(400).send("Email is already register. Please login.");
  };

const userID = generateRandomString();

users[userID] = {
  id: userID,
  email,
  password
};

res.cookie("user_id", userID);
res.redirect("/urls");
});


//Login process:

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Please fill in all requested fields.");
  };

  if (!findUserByEmail(email)) {
    return res.status(403).send("Email not found. Please register.");
  };

  if (findUserByEmail(email).password !== password) {
    return res.status(403).send("Wrong password. Please try again.");
  };

  const userID = findUserByEmail(email).id;

  res.cookie("user_id", userID);
  res.redirect("/urls");
  });


// Logout process:

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});


// Add new URL process:

app.post("/urls", (req, res) => {
  console.log(req.body);
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});


// Edit URL process:

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls");
});


// Delete URL process:

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});
