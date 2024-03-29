const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
  profileImg: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1539694023178-80dde47136c1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
  },
  bio: {
    type: String,
    required: true,
    default: "Edit your bio by clicking Edit profile!",
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      default: [],
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      default: [],
    },
  ],
});

mongoose.model("UserModel", userSchema);
