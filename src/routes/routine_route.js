const express = require("express");
const router = express.Router();
const validate_fields_middleware = require("../middlewares/validate_fields_middleware");
const {
  create_routine,
  find_routines,
  find_specific_routine,
  update_specific_routine
} = require("../controllers/routine_controller");
const auth_middleware = require("../middlewares/auth_middleware");
const check_invalid_tokens_middleware = require("../middlewares/invalid_token_middleware");

/**
 * POST route to create a new routine
 *
 * @route {POST} /v1/routine/
 * @body {String} routine_name - Is required
 * @body {String} time_before_start - Is required. Must be like
 * ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * @body {String} description - Is required
 *
 * @throws {CustomError} - If attributes of the body don't match the requirements specified before
 * or if there is an error while creating the routine
 */
router.post(
  "/",
  validate_fields_middleware.body_must_contain_attributes([
    "routine_name",
    "time_before_start",
    "description",
  ]),
  check_invalid_tokens_middleware,
  auth_middleware,
  create_routine
);

/**
 * GET route to find all routines of user
 *
 * @route {GET} /v1/routine/
 * @query sort_by (optional) - The attribute by which to order, can be by routine_name, created_at or usage_routine
 * @query order (optional) - In which order to do it, ascending, ASC should be written or descending,
 * DESC should be written
 *
 * @throws {CustomError} - If the queries bring illegal values or if something goes wrong
 * with the database
 */
router.get(
  "/",
  check_invalid_tokens_middleware,
  auth_middleware,
  find_routines
);

/**
 * GET route to find a specific routine
 *
 * @route {GET} /v1/routine/:id_routine
 *
 * @throws {CustomError} - If the routine isn't found or if something goes wrong with the database
 */
router.get(
  "/:id_routine",
  check_invalid_tokens_middleware,
  auth_middleware,
  find_specific_routine
);

/**
 * Updates a specific routine's information
 * Requires authentication
 *
 * @route {PUT} /v1/routine/:id_routine
 *
 * Attributes allow to change
 * @body {String} routine_name
 * @body {number} usage_routine
 * @body {String} time_before_start. Must be like ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * @body {String} description
 * @body {Boolean} is_favorite
 *
 * @throws {CustomError} - If the routine isn't found in database, if there is no body
 * or if something goes wrong with the database
 */
router.put(
  "/:id_routine",
  check_invalid_tokens_middleware,
  auth_middleware,
  update_specific_routine
);

module.exports = router;
