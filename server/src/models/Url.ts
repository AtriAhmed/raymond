const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema(
  {
    url: String,
    short: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Url", UrlSchema);

export {};
