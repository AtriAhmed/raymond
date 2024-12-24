const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema(
  {
    url: String,
    alias: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    fingerprint: String,
    visits: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Url", UrlSchema);

export {};
