import { Request, Response } from "express";
const { create, verify } = require("../../../controllers/users");
const mockingoose = require("mockingoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../../../models/User");
const TempAccount = require("../../../models/TempAccount");

// Mock dependencies
jest.mock("bcrypt");
jest.mock("nodemailer");

describe("Users Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let sendMailMock: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock nodemailer transport
    sendMailMock = jest.fn();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("verify", () => {
    it("should return validation errors for invalid data", async () => {
      req.body = { token: "", otp: "" };
      await verify(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Array),
        })
      );
    });

    it("should verify a user and create an account", async () => {
      req.body = { token: "validtoken", otp: "123456" };

      const tempAccount = {
        _id: "123",
        email: "test@example.com",
        password: "hashedpassword",
        otp: "hashedotp",
        token: "validtoken",
      };

      mockingoose(TempAccount).toReturn(tempAccount, "findOne");
      mockingoose(User).toReturn(null, "findOne");

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await verify(req as Request, res as Response);

      const mongoose = require("mongoose");

      expect(bcrypt.compare).toHaveBeenCalledWith("123456", "hashedotp");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            attributes: expect.objectContaining({
              accessId: expect.any(Number),
              active: expect.any(Number),
              email: "test@example.com",
              picture: expect.any(String),
              username: expect.any(String),
            }),
            id: expect.any(mongoose.Types.ObjectId),
            type: "user",
          }),
        })
      );
    });

    it("should return an error for an invalid OTP", async () => {
      req.body = { token: "validtoken", otp: "wrongotp" };

      const tempAccount = {
        _id: "123",
        email: "test@example.com",
        password: "hashedpassword",
        otp: "hashedotp",
        token: "validtoken",
      };

      mockingoose(TempAccount).toReturn(tempAccount, "findOne");
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await verify(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Array),
        })
      );
    });

    it("should return an error for an invalid token", async () => {
      req.body = { token: "invalidtoken", otp: "123456" };
      mockingoose(TempAccount).toReturn(null, "findOne");

      await verify(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Array),
        })
      );
    });
  });
});
