/////////////////////
// TINYAPP PROJECT //
/////////////////////

// TinyApp is a full stack web app built with Node and Express.
// It allows users to shorten long URLs.



////////////////////////////////
// SERVER SETUP & MIDDLEWARE: // 
////////////////////////////////

const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const morgan = require("morgan");
app.use(morgan('dev'));


// Cookie Parser with Encryption:
const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: "session",
  keys: ["12312312312312", "1231231231231s"],
}));

// Password Hasher:
const bcrypt = require("bcryptjs");

//Listener:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


////////////////////////
// TINYAPP DATABASES: //
////////////////////////

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
    password: bcrypt.hashSync("123", 10)
  },
  def456: {
    id: "def456",
    email: "d@d.com",
    password: bcrypt.hashSync("456", 10)
  }
};


///////////////////////////////
// TINYAPP HELPER FUNCTIONS: //
///////////////////////////////

const { 
  generateRandomString, 
  findUserByEmail, 
  findUserID,
  getUserURLS 
} = require("./helpers");



////////////////////////
////////  GETS  ////////
////////////////////////


////////////////////////
// REGISTRATION PAGE: //
////////////////////////

app.get("/register", (req, res) => {

  const userID = req.session.user_id;
  const user = users[userID];

  // Redirect if user already logged in:
  if (userID) {
    return res.redirect("/urls");
  };

  const templateVars = {
    user
  };
  
  res.render("urls_register", templateVars);
});


/////////////////
// LOGIN PAGE: //
/////////////////

app.get("/login", (req, res) => {

  const userID = req.session.user_id;
  const user = users[userID];

// Redirect if user already has cookie from logging in:
  if (userID) {
    return res.redirect("/urls");
  };

  const templateVars = {
    user
  };

res.render("urls_login",  templateVars)
});


////////////////////////////
// DISPLAY ALL URLS PAGE: //
////////////////////////////

app.get("/urls", (req, res) => {

  const userID = req.session.user_id;
  const user = users[userID];
  const usersURLS = getUserURLS(userID, urlDatabase);

  // Check if user has cookie from login:
  if (!userID) {
    return res.status(400).send("Please login to access your tiny URLs.");
  };

  const templateVars = {
    url: urlDatabase,
    usersURLS,
    user
  };

  res.render("urls_index", templateVars);
});


//////////////////////////
// CREATE NEW URL PAGE: //
//////////////////////////

app.get("/urls/new", (req, res) => {

  const userID = req.session.user_id;
  const user = users[userID];

  // Check if user has cookie from login:
  if (!userID) {
    return res.redirect("/login");
  };

  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});


////////////////////////////////
// INDIVIDUAL SHORT URL PAGE: //
////////////////////////////////

app.get("/urls/:id", (req, res) => {

  const id = req.params.id;
  const userID = req.session.user_id;
  const user = users[userID];
  const userURLS = urlDatabase[id].userID;
  const longURL = urlDatabase[id].longURL;

  // Check if user has cookie from login:
  if (!userID) {
    return res.status(400).send("Please login to access your URLS.");
  };

  // Check if user's id matches id connected with the short URL:
  if (userID !== userURLS) {
    return res.status(401).send("This page is not available.");
  };

  const templateVars = {
    id,
    longURL,
    user
  };
  res.render("urls_show", templateVars);
});


////////////////////////////////
// INDIVIDUAL REDIRECT LINKS: //
////////////////////////////////

app.get("/u/:id", (req, res) => {

  const uID = req.params.id;
  const longURL = urlDatabase[uID].longURL;

  // Check if the short URL code exists:
  if (!findUserID(uID, urlDatabase)){
    return res.status(400).send("Sorry that tiny URL does not exist.");
  };

  // Redirect user to short URL's corresponding long URL:
  res.redirect(longURL);
});


///////////
// JSON: //
///////////

app. get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//////////////////////
// TEST/TEMP PAGES: // 
//////////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



////////////////////////
////////  POSTS  ///////
////////////////////////


///////////////////////////
// REGISTRATION PROCESS: //
///////////////////////////

app.post("/register", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const findEmail = findUserByEmail(email, users);
  const userID = generateRandomString();

  // Check if email and/or password imputs are not given by user:
  if (!email || !password) {
    return res.status(400).send("Please fill in all the requested fields.");
  };

  // Check if given email already exists in the database:
  if (findEmail) {
    return res.status(400).send("Email is already register. Please login.");
  };

// If imputs are given and the email doesn't exist, proceed with registration by adding users info to users database: 
users[userID] = {
  id: userID,
  email,
  password: hashedPassword
};

// Assign user a cookie and redirect after registration is complete:
req.session.user_id = userID;
res.redirect("/urls");
});


////////////////////
// LOGIN PROCESS: // 
////////////////////

app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  // Check if email and/or password imputs are not given by user:
  if (!email || !password) {
    return res.status(400).send("Please fill in all requested fields.");
  };

  const findEmail = findUserByEmail(email, users);
  const userID = findEmail.id;
  const checkPassword = findEmail.password;
  
  // Check if given email already exists in the database:
  if (!findEmail) {
    return res.status(403).send("Email not found. Please register.");
  };
  
  // Check if given password matches hashed password in users database:
  if (!bcrypt.compareSync(password, checkPassword)) {
    return res.status(403).send("Wrong password. Please try again.");
  };
  
  // Assign cookie as userID and redirect to /urls:
  req.session.user_id = userID;
  res.redirect("/urls");
  });


/////////////////////
// LOGOUT PROCESS: //
/////////////////////

app.post("/logout", (req, res) => {

  // Clear user_id cookie and redirect to login page:
  req.session.user_id = null;
  res.redirect("/login");
});


//////////////////////////
// ADD NEW URL PROCESS: //
//////////////////////////

app.post("/urls", (req, res) => {
  
  const userID = req.session.user_id;
  const longURL = req.body.longURL;
  const newShortURL = generateRandomString();

  // Check if user is logged in:
  if (!userID) {
    return res.status(401).send("Please login to create new tiny URLs.");
  };

  // If above conditions are met, assign new URL info to the urlDatabase:
  urlDatabase[newShortURL] = {
    longURL,
    userID
  };
  res.redirect(`/urls/${newShortURL}`);
});


///////////////////////
// EDIT URL PROCESS: //
///////////////////////

app.post("/urls/:id", (req, res) => {

  const id = req.params.id;
  const longURL = req.body.longURL;
  const userID = req.session.user_id;

  // Check if user is logged in:
  if (!userID) {
    return res.status(401).send("Please login to access edit fuction.");
  };

  // Check if user's id matches id connected with URL before allowing them to edit URL:
  if (userID !== urlDatabase[id].userID) {
    return res.status(401).send("This URL is not yours to edit.")
  };

  // If the above conditions are met, allow longURL to be modified in urlDatabase:
  urlDatabase[id] = {
    longURL,
    userID
  };

  res.redirect("/urls");
});


/////////////////////////
// DELETE URL PROCESS: //
/////////////////////////

app.post("/urls/:id/delete", (req, res) => {

  const userID = req.session.user_id;
  const user = users[userID];
  const id = req.params.id;

  // Check if user is logged in before allowing them to delete URL:
  if (!userID) {
    return res.status(401).send("Please login to access delete fuction.");
  };

  // Check if user's id matches id connect with URL before allowing them to delete URL:
  if (userID !== urlDatabase[id].userID) {
    return res.status(401).send("This URL is not yours to delete.")
  };

  // If above conditions are met, allow user to delete URL:
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});
