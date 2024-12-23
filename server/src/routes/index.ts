require("dotenv").config();
import { Response } from "express";
const router = require("express").Router();
const authRoute = require("./auth");
const usersRoute = require("./users");
const accessLevelRoute = require("./accessLevels");

// login route for Users
router.use("/auth", authRoute);

// '/api/user' for all routes involving User Accounts
router.use("/users", usersRoute);

// '/api/accessLevels' for all routes involving Access Levels
router.use("/accessLevels", accessLevelRoute);

// =========== SEND REACT PRODUCTION BUILD ====================
router.get("*", (req: any, res: Response) => {
  res.status(404).send("Route not found");
});

module.exports = router;
