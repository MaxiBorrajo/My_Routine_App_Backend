//Imports

const express = require("express");

const router = express.Router();

const validate_fields_middleware = require("../middlewares/validate_fields_middleware");

const { cache_middleware } = require("../middlewares/cache_middleware");

const passport = require("passport");

const {
  register,
  google_authentication,
  forgot_password,
  reset_password,
  login,
  get_current_user,
  update_current_user,
  logout,
  send_feedback,
  delete_user,
  is_logged_in
} = require("../controllers/user_controller");

const {
  upload_multer,
  process_image,
} = require("../middlewares/upload_images_middleware");

const auth_middleware = require("../middlewares/auth_middleware");

const check_invalid_tokens_middleware = require("../middlewares/invalid_token_middleware");

require("../middlewares/auth_google");

const axios = require('axios');

//Routes

/**
 * Post an email, name, last name and password to register. Then, if everithing goes well, it
 * will send a cookie with an access token, refresh token and certain user information
 *
 * @route {POST} /v1/user/
 * @body {String} email - Is required and must be a valid email
 * @body {String} password - Is required and must have
 * at least one lowercase letter, one uppercase letter,
 * one digit, one special character, and be 8 characters or longer
 * @body {String} name - Is required
 * @body {String} last_name - Is required
 *
 * @throws {CustomError} - If attributes of the body don't match the requirements specified before,
 * if the email is found in database or if there is an error while creating the user
 */
router.post(
  "/",
  validate_fields_middleware.meets_with_email_requirements,
  validate_fields_middleware.meets_with_password_requirements,
  validate_fields_middleware.body_must_contain_attributes([
    "email",
    "password",
    "name",
    "last_name",
  ]),
  register
);

/**
 * Post an email and password to login. Then, if everithing goes well, it
 * will send a cookie with an access token,
 * refresh token and the user information
 *
 * @route {POST} /v1/user/credentials
 * @body {String} email - Is required and must be a valid email
 * @body {String} password - Is required and must have
 * at least one lowercase letter, one uppercase letter,
 * one digit, one special character, and be 8 characters or longer
 *
 * @throws {CustomError} - If attributes of the body don't match the requirements specified before,
 * if the email isn´t found in database, if the password doesn't match with one store in database
 * or if something goes wrong with the authentication
 */
router.post(
  "/credentials",
  validate_fields_middleware.meets_with_email_requirements,
  validate_fields_middleware.meets_with_password_requirements,
  login
);

/**
 * GET route to initiate google's authentication
 * Redirect a user to google's login page to authorize app to use user's information
 * @route GET /v1/user/google
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
 * It'll process of authentication and will send a cookie with an access token,
 * refresh token and certain user information
 * @route GET /v1/user/google/redirect
 * @middleware passport.authenticate('google')
 * @param {Object} req - Request's object from the http request.
 * @param {Object} res - Response's object from the http request
 * @returns {Object} A response object with the user's information
 */
router.get(
  "/google/redirect",
  passport.authenticate("google"),
  cache_middleware,
  google_authentication,
);

/**
 * Post an email to send a link to change the password of the associated account
 *
 * @route {POST} /v1/user/forgot_password
 * @body {String} email - Is required and must be a valid email.
 *
 * @throws {CustomError} - If attributes of the body don't match the requirements specified before,
 * if the email isn't found in database or if there is an error while sending the email
 */
router.post(
  "/forgot_password",
  validate_fields_middleware.meets_with_email_requirements,
  forgot_password
);

/**
 * Update the associated account with a new password
 *
 * @route {PUT} /v1/auth/reset_password/:reset_password_token
 *
 * @body {String} password - Is required and must have
 * at least one lowercase letter, one uppercase letter,
 * one digit, one special character, and be 8 characters or longer.
 *
 * @throws {CustomError} - If the reset password token is not same as the one stored in database,
 * if the reset password token is expired, if the user isn't found in database, or if something
 * goes wrong while changing the password
 */
router.put(
  "/reset_password/:reset_password_token",
  validate_fields_middleware.meets_with_password_requirements,
  reset_password
);

/**
 * GET route to obtain information of the current user
 *
 * @route {GET} /v1/user/
 *
 * @throws {CustomError} - If something goes wrong with the database
 */
router.get(
  "/",
  check_invalid_tokens_middleware,
  auth_middleware,
  cache_middleware,
  get_current_user
);

/**
 * GET route to check is the current user is logged in or not
 *
 * @route {GET} /v1/user/is_logged_in
 */
router.get(
  "/is_logged_in",
  check_invalid_tokens_middleware,
  auth_middleware,
  cache_middleware,
  is_logged_in
);

/**
 * Update a current user's information
 *
 * @route {PUT} /v1/user/
 *
 * Attributes allow to change
 * @body {String} email. Must be valid and not be stored in database
 * @body {String} last_name
 * @body {String} username
 * @body {Date} date_birth
 * @body {String} theme. Must be 'light', 'dark' or 'myroutine'
 * @body {String} experience. Must be 'beginner', 'intermediate' or 'experienced'
 * @body {String} weight. Must be 'KG' or 'LBS'
 * @body {String} goal
 * @body {number} rating. Must be a number between 0 and 5
 * @body {File} image. This will be interpreted as wanting to change the profile picture
 *
 * @throws {CustomError} - If the user tries to his change password, if the user isn't found in database,
 * or if something goes wrong with the database
 */
router.put(
  "/",
  check_invalid_tokens_middleware,
  auth_middleware,
  upload_multer.single("image"),
  process_image,
  validate_fields_middleware.body_must_not_contain_attributes(["password"]),
  update_current_user
);

/**
 * Deletes authorization of the current user
 *
 * @route {DELETE} /v1/user/credentials
 *
 * @throws {CustomError} - If something goes wrong with the database
 */
router.delete(
  "/credentials",
  check_invalid_tokens_middleware,
  auth_middleware,
  logout
);

/**
 * Posts feedback about the app
 *
 * @body {String} comment - Comment with which to give feedback
 *
 * @route {POST} /v1/user/feedback
 *
 * @throws {CustomError} - If something goes wrong with the database
 */
router.post(
  "/feedback",
  check_invalid_tokens_middleware,
  auth_middleware,
  validate_fields_middleware.body_must_contain_attributes(["comment"]),
  send_feedback
);

/**
 * Deletes a specific user
 *
 * @route {DELETE} /v1/user/
 *
 * @throws {CustomError} - If something goes wrong with the database
 */
router.delete(
  "/",
  check_invalid_tokens_middleware,
  auth_middleware,
  delete_user
);

//Exports

module.exports = router;
