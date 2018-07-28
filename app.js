const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();

//Body Parser middleware

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

// DB Connect

mongoose
  .connect(db)
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

// Passport Middleware

app.use(passport.initialize());

// Passport Config File
require("./config/pasport")(passport);

//Use Routes

app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

// Export your Express configuration so that it can be consumed by the Lambda handler
module.exports = app
