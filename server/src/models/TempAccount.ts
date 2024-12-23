const mongoose = require("mongoose");

const TempAccountSchema = new mongoose.Schema(
  {
    email: String,
    password: String,
    token: String,
    otp: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("TempAccount", TempAccountSchema);

export {};
