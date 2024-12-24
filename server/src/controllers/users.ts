import { NextFunction, Request, Response } from "express";

const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const TempAccount = require("../models/TempAccount");

const saltRounds = 10;

const { check, body, validationResult } = require("express-validator");

function removeSpaces(req: any, res: Response, next: NextFunction) {
  if (req.files?.image) {
    req.files.image.name = req.files.image.name.replace(/\s/g, "");
  }
  next();
}

export async function create(req: Request, res: Response) {
  const body = req.body;

  try {
    const hash = await bcrypt.hash(body.password, saltRounds);

    const token = require("crypto").randomBytes(20).toString("hex");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, saltRounds);

    const userData = {
      email: body.email?.toLowerCase(),
      password: hash,
      token,
      otp: otpHash,
    };

    var user = await User.findOne({ email: { $regex: new RegExp("^" + body.email + "$", "i") } });

    if (user) {
      return res.status(400).json({
        errors: [
          {
            status: "400",
            title: "Bad Request",
            detail: "User already exists.",
          },
        ],
      });
    } else {
      console.log("-------------------- here --------------------");
      const emailBody = verificationEmailBody("Mr/Mme,", otp, "1 heure");
      await sendMail("URLShortener verification code", emailBody, body.email);

      user = await TempAccount.create(userData);
    }

    return res.status(200).json({
      data: {
        type: "verificationToken",
        attributes: {
          token,
        },
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Internal Server Error",
          detail: "Something went wrong while creating the user.",
        },
      ],
    });
  }
}

export async function verify(req: Request, res: Response) {
  const body = await req.body;

  try {
    const { token, otp } = body;

    const tempUser = await TempAccount.findOne({ token });

    if (!tempUser) {
      return res.status(400).json({
        errors: [
          {
            status: "400",
            title: "Invalid Token",
            detail: "The provided token is invalid or expired.",
          },
        ],
      });
    }

    let user = await User.findOne({ email: { $regex: new RegExp("^" + tempUser.email + "$", "i") } });

    if (user) {
      return res.status(400).json({
        errors: [
          {
            status: "400",
            title: "Email Already Used",
            detail: "The email address is already associated with an existing account.",
          },
        ],
      });
    }

    const match = await bcrypt.compare(otp, tempUser.otp);

    if (!match) {
      return res.status(400).json({
        errors: [
          {
            status: "400",
            title: "Invalid OTP",
            detail: "The provided OTP is incorrect.",
          },
        ],
      });
    }

    const username = tempUser?.email?.slice(0, tempUser.email.indexOf("@"));
    const userData = {
      username: username,
      email: tempUser.email?.toLowerCase(),
      password: tempUser.password,
      accessId: 1,
      active: 2,
      picture: "/uploads/images/avatar.png",
    };

    user = await User.create(userData);

    const emailBody = welcomeEmailBody("Mr/Mme,");
    await sendMail("Welcome to URLShortener", emailBody, tempUser.email);

    await TempAccount.findByIdAndDelete(tempUser._id);

    req.logIn(user, (err: any) => {
      if (err) {
        return res.status(500).json({
          errors: [
            {
              status: "500",
              title: "Internal Server Error",
              detail: "An unexpected error occurred. Please try again later.",
            },
          ],
        });
      }
    });

    return res.status(201).json({
      data: {
        type: "user",
        id: user._id,
        attributes: {
          username: user.username,
          email: user.email,
          picture: user.picture,
          active: user.active,
          accessId: user.accessId,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Internal Server Error",
          detail: "An unexpected error occurred. Please try again later.",
        },
      ],
    });
  }
}

async function sendMail(subject: string, body: string, email: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL, // generated ethereal user
      pass: process.env.PASSWORD, // generated ethereal password
    },
  });

  const mailOptions = {
    from: `URLShortener <${process.env.EMAIL}>`,
    to: email,
    subject: subject,
    html: body,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(info);
    return info;
  } catch (err: any) {
    throw new Error(err);
  }
}

function verificationEmailBody(name: string, code: string, expiration: string) {
  return `
  <!DOCTYPEhtml>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title></title>

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />
    <style>
      html,
      body {
        margin: 0 auto !important;
        padding: 0 !important;
        height: 100% !important;
        width: 100% !important;
        font-family: "Poppins", sans-serif !important;
        font-size: 14px;
        margin-bottom: 10px;
        line-height: 24px;
        color: white;
        font-weight: 400;
      }

      * {
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
        margin: 0;
        padding: 0;
        font-family: "Poppins", sans-serif !important;
      }

      a {
        text-decoration: none;
      }

      img {
        -ms-interpolation-mode: bicubic;
      }

      .container {
        background: linear-gradient(50deg, #8a21ed 0%, #690fbd 100%, #8a21ed 100%);
      }

      .code {
        padding: 5px 10px;
        margin-inline: 10px;
        border-radius: 5px;
        background:rgb(103, 12, 188);
        color: white;
        font-weight: bold;
        font-size: 16px;
      }
    </style>
  </head>

  <body width="100%" style="margin: 0; padding: 0 !important">
    <div style="width: 100%" class="container">
      <div style="max-width: 600px; width: 100%; margin: auto; padding: 40px 0">

        <div class="width:100%; max-width:600px; margin:0 auto;">
          <div style="text-align: center; padding: 30px 30px 20px">
            <h5 style="margin-bottom: 24px; color: white; font-size: 20px; font-weight: 400; line-height: 28px; text-transform: capitalize">
              Hello ${name},
            </h5>
            <p style="margin-bottom: 10px; color: white; font-size: 16px">
              Thank you for registering with our service. To complete your registration process, please enter the following verification code:
            </p>
            <p style="margin-bottom: 10px; color: white">Verification Code: <span class="code">${code}</span></p>
            <p style="margin-bottom: 10px; color: white">Enter this code on the registration page to validate your account.</p>
            <p style="margin-bottom: 10px; color: white">
              Best regards,<br />
              URLShortener Team
            </p>
          </div>
        </div>
        <div style="width: 100%; max-width: 620px; margin: 0 auto">
          <div style="text-align: center; padding: 20px 20px 0">
            <p style="font-size: 13px; color:white;">Copyright © 2024 URLShortener. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>


  `;
}

function welcomeEmailBody(name: string) {
  return `
  <!DOCTYPEhtml>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title></title>

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />
    <style>
      html,
      body {
        margin: 0 auto !important;
        padding: 0 !important;
        height: 100% !important;
        width: 100% !important;
        font-family: "Poppins", sans-serif !important;
        font-size: 14px;
        margin-bottom: 10px;
        line-height: 24px;
        color: white;
        font-weight: 400;
      }

      * {
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
        margin: 0;
        padding: 0;
        font-family: "Poppins", sans-serif !important;
      }

      a {
        text-decoration: none;
      }

      img {
        -ms-interpolation-mode: bicubic;
      }

      .container {
        background: linear-gradient(50deg, #8a21ed 0%, #690fbd 100%, #8a21ed 100%);
      }

      .code {
        padding: 5px 10px;
        margin-inline: 10px;
        border-radius: 5px;
        background:rgb(103, 12, 188);
        color: white;
        font-weight: bold;
        font-size: 16px;
      }
    </style>
  </head>

  <body width="100%" style="margin: 0; padding: 0 !important">
    <div style="width: 100%" class="container">
      <div style="max-width: 600px; width: 100%; margin: auto; padding: 40px 0">

        <div class="width:100%; max-width:600px; margin:0 auto;">
          <div style="text-align: center; padding: 30px 30px 20px">
            <h5 style="margin-bottom: 24px; color: white; font-size: 20px; font-weight: 400; line-height: 28px; text-transform: capitalize">
              Hello ${name},
            </h5>
            <p style="margin-bottom: 10px; color: white; font-size: 16px">
              Welcome to URLShortener. We are excited to have you on board.
            </p>
            <p style="margin-bottom: 10px; color: white">
              Best regards,<br />
              URLShortener Team
            </p>
          </div>
        </div>
        <div style="width: 100%; max-width: 620px; margin: 0 auto">
          <div style="text-align: center; padding: 20px 20px 0">
            <p style="font-size: 13px; color:white;">Copyright © 2024 رعاية. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>


  `;
}
