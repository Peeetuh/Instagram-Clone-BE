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
              bio: userInDB.bio,
              followers: userInDB.followers,
              following: userInDB.following
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

  UserModel.findOneAndUpdate({ _id: req.user._id }, { $set: { bio: bio } })
    .then((updatedUser) => {
      res.status(200).json({ user: updatedUser });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "Server error" });
    });
});


 
router.post('/users/:userId/follow', protectedRoute, async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId); // user to follow~
    const userToFollow = await UserModel.findById(userId);
    console.log(userToFollow); // extracting the userId from database to follow.

    // Check if the user to follow exists
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is already following the userToFollow
    if (req.user.following.includes(userId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Follow the user
    req.user.following.push(userId);
    userToFollow.followers.push(req.user.id); // Add the current user to the followers list of the user being followed
    await req.user.save();
    await userToFollow.save();

    return res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


//6423612f342066538667b9f5 one, one is following 2
//6423613d342066538667b9f8 two, two is following 1, perfect
// token(person following), id(person being followed) 

router.post('/users/:userId/unfollow', protectedRoute, async (req, res) => {
  try {
    const userId = req.params.userId;
    const userToUnfollow = await UserModel.findById(userId);

    // Check if the user to unfollow exists
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is not already following the userToUnfollow
    if (!req.user.following.includes(userId)) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    // Log the following array before unfollowing the user
    console.log('Before unfollowing:', req.user.following);

    // Unfollow the user
    const userIdString = userId.toString(); // convert the user ID to a string
    req.user.following = req.user.following.filter((id) => id.toString() !== userIdString);

    // Log the following array after unfollowing the user
    console.log('After unfollowing:', req.user.following);

    userToUnfollow.followers = userToUnfollow.followers.filter((id) => id !== req.user._id);
    await req.user.save();
    await userToUnfollow.save();

    return res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
