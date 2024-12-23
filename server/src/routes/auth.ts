import { Router, Response } from "express";
const passport = require("passport");

const router = Router();

// '/api/login' route
router.post(
  "/login",
  // Using local strategy to redirect back to the signin page if there is an error
  function (req, res, next) {
    passport.authenticate("local", function (err: any, user: any, info: any) {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).send(info);
      }

      req.logIn(user, function (err: any) {
        if (err) {
          return next(err);
        }
        return res.status(200).send(user);
      });
    })(req, res, next);
  }
);

// '/api/login/status' route
router.get("/status", (req: any, res: Response) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ user: req.user });
  }
  res.status(200).json({
    user: null,
  });
});

router.post("/logout", (req: any, res: Response) => {
  req.session.destroy((err: any) => {
    if (err) {
      console.log(err);
    }
    res.status(200).json({
      user: null,
    });
  });
  req.logout();
});

module.exports = router;
