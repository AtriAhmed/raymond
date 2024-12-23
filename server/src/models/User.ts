const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      lowercase: true,
    },
    email: String,
    password: String,
    picture: String,
    accessId: Number,
    active: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

export {};
