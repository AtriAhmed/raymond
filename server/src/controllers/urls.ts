import { Request, Response } from "express";
const Url = require("../models/Url");

// Helper function to generate a random alias
const generateAlias = (): string => {
  return Math.random().toString(36).substring(2, 8); // Generates a random string of 6 characters
};

// Recursive function to find a unique alias
const generateUniqueAlias = async (): Promise<string> => {
  let alias = generateAlias();
  while (await Url.findOne({ alias })) {
    alias = generateAlias(); // Regenerate if alias already exists
  }
  return alias;
};

export const create = async (req: Request, res: Response): Promise<any> => {
  const { url, alias, fingerprint } = req.body;

  try {
    // Generate a new alias if not provided and ensure uniqueness
    const aliasToUse = alias || (await generateUniqueAlias());

    // Check if the provided alias already exists (if alias was manually set)
    if (alias) {
      const existingUrl = await Url.findOne({ alias });
      if (existingUrl) {
        return res.status(409).json({
          errors: [
            {
              status: "409",
              title: "Conflict",
              detail: `The alias '${alias}' is already in use. Please choose a different one.`,
            },
          ],
        });
      }
    }

    // Create a new shortened URL with the provided or generated alias
    const newUrl = await Url.create({
      url,
      alias: aliasToUse,
      fingerprint,
    });

    res.status(201).json({
      data: {
        type: "shortUrl",
        id: newUrl._id,
        attributes: {
          originalUrl: newUrl.url,
          shortenedUrl: `${process.env.API_URL}/${aliasToUse}`,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Internal Server Error",
          detail: "Something went wrong while creating the shortened URL.",
        },
      ],
    });
  }
};

export const redirect = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    // Find the URL document by alias
    const url = await Url.findOne({ alias: id });

    if (!url) {
      return res.status(404).json({
        errors: [
          {
            status: "404",
            title: "Not Found",
            detail: "Shortened URL not found.",
          },
        ],
      });
    }

    // Increment the visits count
    url.visits += 1;
    await url.save();

    // Redirect to the original URL
    res.redirect(url.url);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Internal Server Error",
          detail: "Something went wrong while redirecting to the original URL.",
        },
      ],
    });
  }
};

export const getUrls = async (req: Request, res: Response): Promise<any> => {
  const { fingerprint } = req.query;
  const user = req.user; // Assuming `req.user` contains the authenticated user information

  try {
    let urls;

    if (user) {
      // Fetch URLs created by the connected user
      urls = await Url.find({ creator: user._id });
    } else if (fingerprint) {
      // Fetch URLs associated with the provided fingerprint
      urls = await Url.find({ fingerprint });
    } else {
      // No connected user or fingerprint provided, return nothing
      return res.status(200).json({ data: [] });
    }

    // Respond with the fetched URLs
    res.status(200).json({
      data: urls.map((url: any) => ({
        id: url._id,
        attributes: {
          originalUrl: url.url,
          shortenedUrl: `${process.env.API_URL}/${url.alias}`,
          visits: url.visits,
          createdAt: url.createdAt,
        },
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Internal Server Error",
          detail: "Something went wrong while fetching URLs.",
        },
      ],
    });
  }
};
