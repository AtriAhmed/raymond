"use strict";
import { Response } from "express";
require("dotenv").config();
const express = require("express");
const app = express();
const routes = require("./routes/index");
const fileUpload = require("express-fileupload");
const path = require("path");

require("./config/mongooseConnect");

const passport = require("passport");
require("./config/passportConfig")(passport); // pass passport for configuration

const session = require("express-session");

const MongoStore = require("connect-mongo");

const PORT = process.env.PORT;
const cors = require("cors");
var corsOptions = {
  credentials: true,
  origin: [process.env.APP_URL],
};

const mongoose = require("mongoose");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "../public")));
app.use(cors(corsOptions));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30, // 3600000 1 hour in milliseconds. The expiration time of the cookie to set it as a persistent cookie.
      sameSite: true,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

app.listen(PORT, () => console.log(`React API server listening on http://localhost:${PORT}`));
