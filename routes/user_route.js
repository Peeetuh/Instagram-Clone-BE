const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const UserModel = mongoose.model("UserModel");
const { JWT_SECRET } = require("../config");
const protectedRoute = require("../middleware/protectedRoutes");

router.post("/signup", (req, res) => {
  const { fullName, email, password, profileImg } = req.body;
  if (!fullName || !password || !email) {
    return res
      .status(400)
      .json({ error: "One or more mandatory fields are empty." });
  }
  UserModel.findOne({ email: email })
    .then((userInDB) => {
      if (userInDB) {
        return res
          .status(500)
          .json({ error: "User with this email already registered" });
      }
      bcryptjs
        .hash(password, 16)
        .then((hashedPassword) => {
          const user = new UserModel({
            fullName,
            email,
            password: hashedPassword,
            profileImg,
          });
          user.save().then((newUser) => {
            res.status(201).json({ result: "User Signed up Successfully!" });
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!password || !email) {
    return res
      .status(400)
      .json({ error: "One or more mandatory fields are empty." });
  }
  UserModel.findOne({ email: email })
    .then((userInDB) => {
      if (!userInDB) {
        return res.status(401).json({ error: "Invalid Email" });
      }
      bcryptjs
        .compare(password, userInDB.password)
        .then((matchedCredentials) => {
          if (matchedCredentials) {
            const jwtToken = jwt.sign({ _id: userInDB._id }, JWT_SECRET);
            const userInfo = {
              _id: userInDB._id,
              email: userInDB.email,
              fullName: userInDB.fullName,
              profileImg: userInDB.profileImg,
            };
            res
              .status(200)
              .json({ result: { token: jwtToken, user: userInfo } });
          } else {
            return res.status(401).json({ error: "Invalid Password" });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put("/users/:id/bio", protectedRoute, (req, res) => {
  const { bio } = req.body;
  if (!bio) {
    return res
      .status(400)
      .json({ error: "One or more mandatory fields are invalid or empty" });
  }

  UserModel.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { bio: bio } },
    { new: true }
  )
    .then((updatedUser) => {
      res.status(200).json({ user: updatedUser });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "Server error" });
    });
});

module.exports = router;
