const express = require("express");
const router = express.Router();
const validate_fields_middleware = require("../middlewares/validate_fields_middleware");
const passport = require("passport");
const {register} = require('../controllers/user_controller')
const {return_response} = require('../utils/utils_functions')
require("../middlewares/auth_google");

//Registro normal
router.post(
  "/",
  validate_fields_middleware.meets_with_email_requirements(req, res, next),
  validate_fields_middleware.meets_with_password_requirements(req, res, next),
  validate_fields_middleware.body_must_contain_attributes(["name", "lastName"]),
  async (req, res, next) => {
    try {
      const resource = await register(req.body);
      res.cookie("access_token", resource.access_token, {
        maxAge: 120*1000,
        httpOnly: true,
        secure: true
      });
      res.cookie("refresh_token", resource.refresh_token, {
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
        secure: true
      });
      return_response(res, 200, resource.user, true);
    } catch (error) {
      next(error)
    }
  }
);

//Login de jwt
router.post(
  "/credentials",
  (req, res) => {
    res.send(`Hola ${done}`);
  }
);

//Login de google
/**
 * GET route to initiate google's authentication
 * Redirect a user to google's login page to authoriza app to use user's information.
 * @route GET /auth/google
 * @returns {void}
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

/**
 * GET route to manage redirection after google's authentication.
 * It'll process of authentication and will send a response to the client.
 * @route GET /auth/google/redirect
 * @middleware passport.authenticate('google')
 * @param {Object} req - Request's object from the http request.
 * @param {Object} res - Response's object from the http request
 * @returns {void}
 */
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  console.log(req.user)
  res.send(`Hola ${req.user.username}`);
});

module.exports = router;
