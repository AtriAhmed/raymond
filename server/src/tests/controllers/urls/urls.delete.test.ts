import { Request, Response } from "express";
const { deleteUrl } = require("../../../controllers/urls");
const mockingoose = require("mockingoose");
const Url = require("../../../models/Url");

describe("URL Shortener Controller - Delete", () => {
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

  it("should return validation errors for invalid ID", async () => {
    req.params = { id: "invalid-id" };
    await deleteUrl(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.any(Array),
      })
    );
  });

  it("should return not found error if URL does not exist", async () => {
    req.params = { id: "6769b0f4515a7b87ef1fc167" };

    mockingoose(Url).toReturn(null, "findOne");

    await deleteUrl(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([expect.objectContaining({ detail: expect.any(String) })]),
      })
    );
  });

  it("should return forbidden error if user is not the creator", async () => {
    req.params = { id: "6769b0f4515a7b87ef1fc167" };
    req.user = { _id: "6769b0f4515a7b87ef1fc163" };

    mockingoose(Url).toReturn({ _id: "6769b0f4515a7b87ef1fc167", user: "6769b0f4515a7b87ef1fc165" }, "findOne");

    await deleteUrl(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([expect.objectContaining({ detail: expect.any(String) })]),
      })
    );
  });

  it("should delete the URL if user is the creator", async () => {
    req.params = { id: "6769b0f4515a7b87ef1fc167" };
    req.user = { _id: "6769b0f4515a7b87ef1fc163" };

    mockingoose(Url).toReturn({ _id: "6769b0f4515a7b87ef1fc167", user: "6769b0f4515a7b87ef1fc163" }, "findOne");
    mockingoose(Url).toReturn({ _id: "6769b0f4515a7b87ef1fc167" }, "deleteOne");

    await deleteUrl(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          attributes: expect.objectContaining({
            message: "The URL has been successfully deleted.",
          }),
        }),
      })
    );
  });

  it("should handle errors during deletion gracefully", async () => {
    req.params = { id: "6769b0f4515a7b87ef1fc167" };
    req.user = { _id: "6769b0f4515a7b87ef1fc163" };

    mockingoose(Url).toReturn({ _id: "6769b0f4515a7b87ef1fc167", user: "6769b0f4515a7b87ef1fc163" }, "findOne");
    mockingoose(Url).toReturn(new Error("Deletion failed"), "deleteOne");

    await deleteUrl(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([expect.objectContaining({ detail: expect.any(String) })]),
      })
    );
  });
});
