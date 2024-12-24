import { Router } from "express";
import * as usersController from "../controllers/users";

const router = Router();

router.route("/").post(usersController.create);

router.route("/verify").put(usersController.verify);

module.exports = router;
