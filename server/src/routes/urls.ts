import { Router } from "express";
import * as urlsController from "../controllers/urls";

const router = Router();

// Matches with "/api/user"
router
  .route("/urls")
  // POST "/api/user" Example Request: { "vals": ["test_user", "111111", 1] }
  .post(urlsController.create) // create a new user
  .get(urlsController.getUrls);

router.route("/:id").get(urlsController.redirect);

module.exports = router;
