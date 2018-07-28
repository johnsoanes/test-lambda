const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

//Load Input Validation

const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//Load User Model

const User = require("../../models/User");

// @route GET /api/users/test
// @desc Tests Users route
// @access public

router.get("/test", (req, res) => res.json({ msg: "Users Works" }));

// @route GET /api/users/register
// @desc Register User
// @access public

router.post("/register", (req, res) => {
  //Perform Input Validation
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200",
        r: "pg",
        d: "mm"
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        })
      );
    }
  });
});

// @route GET /api/users/login
// @desc Login User and Return Token
// @access public

router.post("/login", (req, res) => {
  //Perform Input Validation
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  // Find User in DB

  User.findOne({ email }).then(user => {
    // Check User
    if (!user) {
      return res.status(404).json({ email: "No Such Email Address" });
    }

    // Check Password

    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User Matched - Sign Token

        const payload = { id: user.id, name: user.name, avatar: user.avatar };

        //sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res.status(400).json({ password: "Incorrect Password" });
      }
    });
  });
});

// @route GET /api/users/current
// @desc Passport and Token test of current user
// @access private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;