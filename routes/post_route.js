const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const PostModel = mongoose.model("PostModel");
const UserModel = mongoose.model("UserModel");
const protectedRoute = require("../middleware/protectedRoutes");

//all users posts
router.get("/allposts", (req, res) => {
  PostModel.find()
    .populate("author", "_id fullName profileImg")
    .populate("comments.commentedBy", "_id fullName")
    .then((dbPosts) => {
      res.status(200).json({ posts: dbPosts });
    })
    .catch((error) => {
      console.log(error);
    });
});

//all posts only from logged in user
router.get("/myposts", protectedRoute, (req, res) => {
  PostModel.find({ author: req.user._id })
    .populate("author", "_id fullName profileImg")
    .then((dbPosts) => {
      res.status(200).json({ posts: dbPosts });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post("/createpost", protectedRoute, (req, res) => {
  const { description, location, image } = req.body;
  if (!description || !location || !image) {
    return res
      .status(400)
      .json({ error: "One or more mandatory fields are invalid or empty" });
  }
  req.user.password = undefined;
  const postObj = new PostModel({
    description: description,
    location: location,
    image: image,
    author: req.user,
  });
  postObj
    .save()
    .then((newPost) => {
      res.status(201).json({ post: newPost });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.patch("/updateProfileImg", protectedRoute, (req, res) => {
  console.log(req.body);
  const { profileImg } = req.body;
  console.log(profileImg);
  if (!profileImg) {
    return res
      .status(400)
      .json({ error: "One or more mandatory fields are invalid or empty" });
  }
  UserModel.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { profileImg: profileImg } },
    { new: true }
  )
    .then((updatedUser) => {
      res.status(200).json({ user: updatedUser });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    });
});

//delete without id
// router.delete("/deletepost/:postId", (req, res) => {
//   PostModel.findOne({ _id: req.params.postId })
//     .populate("author", "_id")
//     .exec((error, postFound) => {
//       if (error || !postFound) {
//         return res.status(400).json({ error: "Post was not found." });
//       }
//       //check if the post author is the same as loggedin user, only then we allow deletion.
//       if (postFound.author._id.toString() === req.user._id.toString()) {
//         postFound
//           .remove()
//           .then((data) => {
//             res.status(200).json({ result: data });
//           })
//           .catch((error) => {
//             console.log(error);
//           });
//       }
//     });
// });

router.delete("/deletepost/:postId", protectedRoute, (req, res) => {
  PostModel.findOne({ _id: req.params.postId })
    .populate("author", "_id")
    .exec((error, postFound) => {
      if (error || !postFound) {
        return res.status(400).json({ error: "Post was not found." });
      }
      //check if the post author is the same as loggedin user, only then we allow deletion.
      if (postFound.author._id.toString() === req.user._id.toString()) {
        postFound
          .remove()
          .then((data) => {
            res.status(200).json({ result: data });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
});

router.put("/like", protectedRoute, (req, res) => {
  PostModel.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id },
    },
    {
      new: true, // returns updated data
    }
  )
    .populate("author", "_id fullName")
    .exec((error, result) => {
      if (error) {
        return res.status(400).json({ error: error });
      } else {
        res.json(result);
      }
    });
});

router.put("/dislike", protectedRoute, (req, res) => {
  PostModel.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true, // returns updated data
    }
  )
    .populate("author", "_id fullName")
    .exec((error, result) => {
      if (error) {
        return res.status(400).json({ error: error });
      } else {
        res.json(result);
      }
    });
});

router.put("/comment", protectedRoute, (req, res) => {
  const comment = {
    commentText: req.body.commentText,
    commentedBy: req.user._id,
  };

  PostModel.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    {
      new: true, // returns updated data
    }
  )
    .populate("comments.commentedBy", "_id fullName") //comment owner
    .populate("author", "_id fullName") // post owner
    .exec((error, result) => {
      if (error) {
        return res.status(400).json({ error: error });
      } else {
        res.json(result);
      }
    });
});




module.exports = router;
