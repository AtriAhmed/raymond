import { Request, Response } from "express";
const { redirect } = require("../../../controllers/urls");
const mockingoose = require("mockingoose");
const Url = require("../../../models/Url");

describe("URL Shortener Controller - Redirect", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return validation errors for invalid parameters", async () => {
    req.params = { id: "" }; // Invalid id

    await redirect(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.any(Array),
      })
    );
  });
});
