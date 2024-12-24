import { Router } from "express";
import * as urlsController from "../controllers/urls";

const router = Router();

const limiter = require("../middleWares/rateLimiter");

router.route("/urls").post(limiter(20), urlsController.create).get(limiter(), urlsController.getUrls);

router.route("/urls/:id").put(urlsController.update).delete(urlsController.deleteUrl);

router.route("/:id").get(urlsController.redirect);

module.exports = router;
