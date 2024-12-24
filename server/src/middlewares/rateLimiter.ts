import rateLimit from "express-rate-limit";

// Define rate-limiting middleware
const limiter = (max: number = 1000) =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: max, // Limit each IP to 100 requests per windowMs
    statusCode: 429,
    message: {
      errors: [
        {
          status: "429",
          title: "Too Many Requests",
          detail: "You have exceeded the request limit. Please try again later.",
        },
      ],
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
module.exports = limiter;
