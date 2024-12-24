import { Router } from "express";
import * as urlsController from "../controllers/urls";

const router = Router();

const limiter = require("../middleWares/rateLimiter");

// Matches with "/api/user"
router
  .route("/urls")
  // POST "/api/user" Example Request: { "vals": ["test_user", "111111", 1] }
  .post(limiter(20), urlsController.create) // create a new user
  .get(limiter(), urlsController.getUrls);

router.route("/urls/:id").put(urlsController.update);

router.route("/:id").get(urlsController.redirect);

module.exports = router;
