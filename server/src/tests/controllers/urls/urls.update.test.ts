import { Request, Response } from "express";
const { update } = require("../../../controllers/urls");
const mockingoose = require("mockingoose");
const Url = require("../../../models/Url");

describe("URL Shortener Controller - Update", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return validation errors for invalid request body", async () => {
    req.body = { url: "invalid-url" };
    await update(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.any(Array),
      })
    );
  });

  it("should return not found error if URL does not exist", async () => {
    req.params = { id: "6769b0f4515a7b87ef1fc167" };
    req.body = { url: "https://example.com" };

    mockingoose(Url).toReturn(null, "findOne");

    await update(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([expect.objectContaining({ detail: expect.any(String) })]),
      })
    );
  });

  it("should return conflict error if alias is already in use", async () => {
    req.params = { id: "6769b0f4515a7b87ef1fc167" };
    req.body = { alias: "existingAlias" };

    mockingoose(Url).toReturn({ _id: "6769b0f4515a7b87ef1fc168" }, "findOne");

    await update(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([expect.objectContaining({ detail: expect.any(String) })]),
      })
    );
  });

  it("should update the URL and alias if valid", async () => {
    req.params = { id: "6769b0f4515a7b87ef1fc167" };
    req.body = { url: "https://example.com", alias: "newAlias" };

    const existingUrl = { _id: "6769b0f4515a7b87ef1fc167", url: "https://old.com", alias: "oldAlias" };

    mockingoose(Url).toReturn(existingUrl, "findOne");
    mockingoose(Url).toReturn({ ...existingUrl, url: "https://example.com", alias: "newAlias" }, "save");

    await update(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          attributes: expect.objectContaining({
            originalUrl: "https://example.com",
            shortenedUrl: expect.any(String),
          }),
        }),
      })
    );
  });
});
