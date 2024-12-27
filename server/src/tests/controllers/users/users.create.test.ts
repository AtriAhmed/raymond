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

  describe("create", () => {
    it("should return validation errors for invalid data", async () => {
      req.body = { email: "invalid-email", password: "123" };
      await create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Array),
        })
      );
    });

    it("should create a temporary user and send an email", async () => {
      req.body = { email: "test@example.com", password: "password123" };

      mockingoose(TempAccount).toReturn(null, "findOne");
      mockingoose(User).toReturn(null, "findOne");

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
      sendMailMock.mockResolvedValue({});

      await create(req as Request, res as Response);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(sendMailMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            type: "verificationToken",
            attributes: {
              token: expect.any(String),
            },
          },
        })
      );
    });

    it("should return an error if the user already exists", async () => {
      req.body = { email: "test@example.com", password: "password123" };

      mockingoose(User).toReturn({ email: "test@example.com" }, "findOne");

      await create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Array),
        })
      );
    });
  });
});
