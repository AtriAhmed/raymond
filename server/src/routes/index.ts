require("dotenv").config();
import { Response } from "express";
const router = require("express").Router();
const authRoute = require("./auth");
const usersRoute = require("./users");
const urlsRoute = require("./urls");

// login route for Users
router.use("/auth", authRoute);

// '/api/user' for all routes involving User Accounts
router.use("/users", usersRoute);

router.use("/", urlsRoute);

// =========== SEND REACT PRODUCTION BUILD ====================
router.get("*", (req: any, res: Response) => {
  res.status(404).send("Route not found");
});

module.exports = router;
