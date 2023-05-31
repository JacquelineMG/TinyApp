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


// URLS Database:

const urlDatabase = {
  b2xVn1: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "abc123",
  },
  "8sm5xK": {
    longURL: "http://www.google.com",
    userID: "abc123",
  },
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "def456",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "def456",
  },
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
  for (const userKey in users) {
    if (users[userKey].email === newEmail) {
      return users[userKey];
    }
  } return null;
};


// ID lookup:

const findID = function (newID) {
  for (const key in urlDatabase) {
    if (key === newID) {
      return true
    }
  } return false;
};


// Build user's individual URLS database:

const getURLS = function (usersID) {
  const userURLS = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === usersID) {
      userURLS[key] = {
        longURL: urlDatabase[key].longURL,
        userID: urlDatabase[key].userID
      };
    }
  } return userURLS;
};




////////////////////////
////////  GETS  ////////
////////////////////////


// Registration page:

app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];

  // Redirect if user already logged in:
  if (userID) {
    return res.redirect("/urls");
  };

  const templateVars = {
    user
  }
  res.render("urls_register", templateVars);
});


// Login page:

app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];

// Redirect if user already logged in:

  if (userID) {
    return res.redirect("/urls");
  };

  const templateVars = {
    user
  };

res.render("urls_login",  templateVars)
});


// Display all URLS page:

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];

  if (!userID) {
    return res.status(400).send("Please login to access your URLS.");
  };

  const usersURLS = getURLS(userID);

  const templateVars = {
    url: urlDatabase,
    usersURLS,
    user
  };

  res.render("urls_index", templateVars);
});


// Create new URL page:

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];

  if (!userID) {
    return res.redirect("/login");
  };

  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});


// Individual shortened URL page:

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const userURLS = getURLS(userID);
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;

  if (!userID) {
    return res.status(400).send("Please login to access your URLS.");
  };

  if (userID !== urlDatabase[id].userID) {
    return res.status(401).send("This page is not available.");
  };

  const templateVars = {
    id,
    longURL,
    user
  };
  res.render("urls_show", templateVars);
});


// Individual redirect links page:

app.get("/u/:id", (req, res) => {

  const uID = req.params.id;
  console.log(uID);

  if (!findID(uID)){
    return res.status(400).send("Sorry that tiny URL does not exist.");
  };

  const longURL = urlDatabase[uID].longURL;
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
  
  const userID = req.cookies["user_id"];
  const longURL = req.body.longURL;

  if (!userID) {
    return res.status(401).send("Please login to create new tiny URLS.");
  };

  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL,
    userID
  };
  res.redirect(`/urls/${newShortURL}`);
});


// Edit URL process:

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  const userID = req.cookies["user_id"];

  urlDatabase[id] = {
    longURL,
    userID
  };

  if (!userID) {
    return res.status(401).send("Please login to access edit fuction.");
  };

  if (userID !== urlDatabase[id].userID) {
    return res.status(401).send("This URL is not yours to edit.")
  };

  res.redirect("/urls");
});


// Delete URL process:

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const id = req.params.id;

  if (!userID) {
    return res.status(401).send("Please login to access delete fuction.");
  };

  if (userID !== urlDatabase[id].userID) {
    return res.status(401).send("This URL is not yours to delete.")
  };

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});
