import { Request, Response } from "express";
const { getUrls } = require("../../../controllers/urls");
const mockingoose = require("mockingoose");
const Url = require("../../../models/Url");
const mongoose = require("mongoose");

describe("URL Shortener Controller - Get URLs", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return URLs for authenticated user", async () => {
    req.user = { _id: "6769b0f4515a7b87ef1fc163" };

    const urls = [
      { _id: "1", url: "https://example1.com", alias: "alias1", visits: 10, createdAt: new Date(), image: null },
      { _id: "2", url: "https://example2.com", alias: "alias2", visits: 20, createdAt: new Date(), image: null },
    ];

    mockingoose(Url).toReturn(urls, "find");

    await getUrls(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(mongoose.Types.ObjectId),
            attributes: expect.objectContaining({
              originalUrl: expect.any(String),
              shortenedUrl: expect.any(String),
              alias: expect.any(String),
              visits: expect.any(Number),
              createdAt: expect.any(Date),
            }),
          }),
        ]),
      })
    );
  });

  it("should return URLs for provided fingerprint", async () => {
    req.query = { fingerprint: "fingerprint123" };

    const urls = [
      { _id: "1", url: "https://example1.com", alias: "alias1", visits: 10, createdAt: new Date(), image: null },
      { _id: "2", url: "https://example2.com", alias: "alias2", visits: 20, createdAt: new Date(), image: null },
    ];

    mockingoose(Url).toReturn(urls, "find");

    await getUrls(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(mongoose.Types.ObjectId),
            attributes: expect.objectContaining({
              originalUrl: expect.any(String),
              shortenedUrl: expect.any(String),
              alias: expect.any(String),
              visits: expect.any(Number),
              createdAt: expect.any(Date),
            }),
          }),
        ]),
      })
    );
  });

  it("should return an empty array if no user or fingerprint is provided", async () => {
    await getUrls(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: [] });
  });

  it("should handle errors gracefully", async () => {
    // req.user = { _id: "6769b0f4515a7b87ef1fc163" };
    req.query = { fingerprint: "fingerprint" };

    mockingoose(Url).toReturn(new Error("Database error"), "find");

    await getUrls(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([expect.objectContaining({ detail: expect.any(String) })]),
      })
    );
  });
});
