const express = require("express");
const router = express.Router();
const validate_fields_middleware = require("../../middlewares/validate_fields_middleware");
const passport = require("passport");
require("./auth_google");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  res.send(`Hola ${req.user.displayName}`);
});

module.exports = router;
