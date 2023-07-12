const express = require("express");
const router = express.Router();
const validate_fields_middleware = require("../middlewares/validate_fields_middleware");
const {
  create_exercise
} = require("../controllers/exercise_controller");
const auth_middleware = require("../middlewares/auth_middleware");
const check_invalid_tokens_middleware = require("../middlewares/invalid_token_middleware");

/**
 * POST route to create a new exercise
 *
 * @route {POST} /v1/exercise/
 * @body {String} exercise_name - Is required
 * @body {String} time_after_exercise - Is required. Must be like
 * ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * @body {String} description - Is required
 * @body {number} intensity - Is required. Must be 1 (low), 2 (mid), or 3 (high)
 * @throws {CustomError} - If attributes of the body don't match the requirements specified before
 * or if there is an error while creating the routine
 */
router.post(
  "/",
  validate_fields_middleware.body_must_contain_attributes([
    "exercise_name",
    "time_after_exercise",
    "description",
    "intensity"
  ]),
  check_invalid_tokens_middleware,
  auth_middleware,
  create_exercise
);


module.exports = router;
