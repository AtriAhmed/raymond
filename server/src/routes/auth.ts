import { Router, Response } from "express";
const passport = require("passport");

const router = Router();

// '/api/login' route
router.post(
  "/login",
  // Using local strategy to redirect back to the signin page if there is an error
  passport.authenticate("local"),
  (req: any, res: Response) => {
    console.log("req.sessionID: ", req.sessionID);
    res.status(200).json({ user: req.user });
  }
);

// '/api/login/status' route
router.get("/status", (req: any, res: Response) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ user: req.user });
  }
  res.status(200).json({
    user: {
      accessId: 0,
      type: "visitor",
      _id: 0,
      username: "",
    },
  });
});

router.get("/logout", (req: any, res: Response) => {
  req.session.destroy((err: any) => {
    if (err) {
      console.log(err);
    }
    res.status(200).json({
      user: {
        accessId: 0,
        type: "visitor",
        _id: 0,
        username: "",
      },
    });
  });
  req.logout();
});

module.exports = router;
