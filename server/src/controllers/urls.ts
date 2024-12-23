import { Request, Response } from "express";
const Url = require("../models/Url");

// Function to create a shortened URL
export const create = async (req: Request, res: Response): Promise<any> => {
  const { url } = req.body;

  try {
    // Create a new shortened URL
    const short = Math.random().toString(36);

    const newUrl = await Url.create({
      url,
      short,
    });

    res.status(201).json({
      message: "Shortened URL created successfully",
      shortenedUrl: `${process.env.API_URL}/${short}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Function to redirect to the original URL
export const redirect = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    const url = await Url.findOne({ short: id });

    if (!url) {
      return res.status(404).json({ message: "Shortened URL not found" });
    }

    res.redirect(url.url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
