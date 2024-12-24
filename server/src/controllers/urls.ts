import { Request, Response } from "express";
const openGraphScraper = require("open-graph-scraper");
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

  const user = req.user;

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

    // Fetch Open Graph data
    let ogImage = null;
    try {
      const ogResult = await openGraphScraper({ url });
      if (ogResult.result.success && ogResult.result.ogImage?.[0]?.url) {
        let imageUrl = ogResult.result.ogImage?.[0]?.url;

        if (!/^https?:\/\//i.test(imageUrl)) {
          const baseUrl = new URL(url).origin; // Extract the base URL
          imageUrl = new URL(imageUrl, baseUrl).href; // Resolve the relative URL
        }

        ogImage = imageUrl;
      }
    } catch (ogError) {
      console.error("Failed to fetch Open Graph image:", ogError);
    }

    // Create a new shortened URL with the provided or generated alias
    const newUrl = await Url.create({
      url,
      alias: aliasToUse,
      fingerprint: fingerprint || null,
      user: user ? user._id : null,
      image: ogImage, // Assign fetched image or null
    });

    res.status(201).json({
      data: {
        type: "shortUrl",
        id: newUrl._id,
        attributes: {
          originalUrl: newUrl.url,
          shortenedUrl: `${process.env.API_URL}/${aliasToUse}`,
          image: ogImage,
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
      return res.redirect(`${process.env.APP_URL}/not-found`);
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
      urls = await Url.find({ user: user._id }).sort({ createdAt: -1 });
    } else if (fingerprint) {
      // Fetch URLs associated with the provided fingerprint
      urls = await Url.find({ fingerprint }).sort({ createdAt: -1 });
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
          alias: url.alias,
          visits: url.visits,
          createdAt: url.createdAt,
          image: url.image,
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

// Update route
export const update = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params; // The ID of the URL document to update
  const { url, alias } = req.body;

  try {
    // Find the document by ID
    const existingUrl = await Url.findById(id);

    if (!existingUrl) {
      return res.status(404).json({
        errors: [
          {
            status: "404",
            title: "Not Found",
            detail: `The URL with ID '${id}' was not found.`,
          },
        ],
      });
    }

    // Check if the new alias is already in use (if provided)
    if (alias) {
      const aliasInUse = await Url.findOne({ alias });
      if (aliasInUse && aliasInUse._id.toString() !== id) {
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

    // Generate a new alias if not provided
    const aliasToUse = alias || (await generateUniqueAlias());

    // Update the URL and alias
    existingUrl.url = url || existingUrl.url;
    existingUrl.alias = aliasToUse;

    await existingUrl.save();

    return res.status(200).json({
      data: {
        type: "shortUrl",
        id: existingUrl._id,
        attributes: {
          originalUrl: existingUrl.url,
          shortenedUrl: `${process.env.API_URL}/${existingUrl.alias}`,
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
          detail: "Something went wrong while updating the URL.",
        },
      ],
    });
  }
};

export const deleteUrl = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params; // The ID of the URL document to delete
  const user = req.user; // Assuming `req.user` is populated with the authenticated user

  try {
    // Find the URL by ID
    const url = await Url.findById(id);

    if (!url) {
      return res.status(404).json({
        errors: [
          {
            status: "404",
            title: "Not Found",
            detail: `The URL with ID '${id}' was not found.`,
          },
        ],
      });
    }

    // Check if the authenticated user is the creator of the URL
    if (url.user?.toString() !== user._id.toString()) {
      return res.status(403).json({
        errors: [
          {
            status: "403",
            title: "Forbidden",
            detail: "You are not authorized to delete this URL.",
          },
        ],
      });
    }

    // Delete the URL
    await url.deleteOne();

    return res.status(200).json({
      data: {
        type: "shortUrl",
        id: url._id,
        attributes: {
          message: "The URL has been successfully deleted.",
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
          detail: "Something went wrong while deleting the URL.",
        },
      ],
    });
  }
};
