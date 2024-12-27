import { Request, Response } from "express";
const { create } = require("../../../controllers/urls");
const mockingoose = require("mockingoose");
const Url = require("../../../models/Url");
const openGraphScraper = require("open-graph-scraper");

jest.mock("open-graph-scraper");

describe("URL Shortener Controller - Create", () => {
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

  it("should return validation errors for invalid URL", async () => {
    req.body = { url: "invalid-url" };
    await create(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.any(Array),
      })
    );
  });

  it("should return a conflict error if alias already exists", async () => {
    req.body = { url: "https://example.com", alias: "existingAlias" };

    mockingoose(Url).toReturn({ alias: "existingAlias" }, "findOne");

    await create(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([expect.objectContaining({ detail: expect.any(String) })]),
      })
    );
  });

  it("should create a new shortened URL with a generated alias", async () => {
    req.body = { url: "https://example.com" };

    mockingoose(Url).toReturn(null, "findOne"); // Ensure alias is unique
    mockingoose(Url).toReturn({ _id: "123", alias: "generatedAlias" }, "save");

    openGraphScraper.mockResolvedValue({
      result: { success: true, ogImage: [{ url: "https://example.com/image.jpg" }] },
    });

    await create(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(201);
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

  it("should handle errors during Open Graph scraping gracefully", async () => {
    req.body = { url: "https://example.com" };

    mockingoose(Url).toReturn(null, "findOne"); // Ensure alias is unique
    mockingoose(Url).toReturn({ _id: "123", alias: "generatedAlias" }, "save");

    openGraphScraper.mockRejectedValue(new Error("Scraper failed"));

    await create(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(201);
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

  it("should handle invalid alias format", async () => {
    req.body = { url: "https://example.com", alias: "invalid alias format" };
    await create(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.any(Array),
      })
    );
  });

  it("should handle missing URL field", async () => {
    req.body = {};
    await create(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.any(Array),
      })
    );
  });
});
