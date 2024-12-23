const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema(
  {
    display: String,
    username: {
      type: String,
      unique: true,
      lowercase: true,
    },
    password: String,
    picture: String,
    accessId: Number,
    active: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UrlSchema);

export {};
