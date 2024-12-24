import { Request, Response } from "express";
import { z } from "zod";

const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const TempAccount = require("../models/TempAccount");

const saltRounds = 10;

const createUserSchema = z.object({
  email: z.string().email({ message: "Please provide a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

const verifyUserSchema = z.object({
  token: z.string(),
  otp: z.string(),
});

export async function create(req: Request, res: Response) {
  const validation = createUserSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      errors: validation.error.errors.map((error) => ({
        status: "400",
        title: "Validation Error",
        detail: error.message,
        source: { pointer: error.path.join(".") },
      })),
    });
  }

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
      const emailBody = verificationEmailBody("Mr/Mrs", otp, "1 heure");
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
  const validation = verifyUserSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      errors: validation.error.errors.map((error) => ({
        status: "400",
        title: "Validation Error",
        detail: error.message,
        source: { pointer: error.path.join(".") },
      })),
    });
  }

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

    const emailBody = welcomeEmailBody("Mr/Mrs");
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

function verificationEmailBody(name:string, code:string, expiration:string) {
  return `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: "Poppins", sans-serif;
        background: #f4f4f4;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        padding: 20px 0;
      }
      .header h1 {
        color: #8a21ed;
        margin: 0;
      }
      .content {
        padding: 20px;
        font-size: 16px;
        line-height: 1.6;
      }
      .code {
        display: inline-block;
        padding: 10px 20px;
        margin: 10px 0;
        background: #8a21ed;
        color: #fff;
        font-weight: bold;
        border-radius: 5px;
        font-size: 18px;
      }
      .footer {
        text-align: center;
        padding: 20px;
        font-size: 12px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to URLShortener</h1>
      </div>
      <div class="content">
        <p>Hi ${name},</p>
        <p>
          Thank you for joining URLShortener! To complete your registration, please use the
          following verification code:
        </p>
        <div class="code">${code}</div>
        <p>This code will expire in <strong>${expiration}</strong>.</p>
        <p>
          If you did not sign up for this service, please ignore this email or contact support.
        </p>
        <p>Best regards,<br />The URLShortener Team</p>
      </div>
      <div class="footer">
        <p>&copy; 2024 URLShortener. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
  `;
}


function welcomeEmailBody(name:string) {
  return `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome Email</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: "Poppins", sans-serif;
        background: #f4f4f4;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        padding: 20px 0;
      }
      .header h1 {
        color: #8a21ed;
        margin: 0;
      }
      .content {
        padding: 20px;
        font-size: 16px;
        line-height: 1.6;
      }
      .footer {
        text-align: center;
        padding: 20px;
        font-size: 12px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to URLShortener</h1>
      </div>
      <div class="content">
        <p>Hi ${name},</p>
        <p>
          We're thrilled to have you on board! With URLShortener, you can easily create and manage shortened URLs, track analytics, and much more.
        </p>
        <p>
          Explore your dashboard to get started. If you have any questions, feel free to reach out to our support team.
        </p>
        <p>Best regards,<br />The URLShortener Team</p>
      </div>
      <div class="footer">
        <p>&copy; 2024 URLShortener. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
  `;
}
