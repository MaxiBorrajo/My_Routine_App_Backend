//Imports

const express = require("express");

const router = express.Router();

const {cache_middleware} = require("../middlewares/cache_middleware");

const validate_fields_middleware = require("../middlewares/validate_fields_middleware");

const {
  find_all_days,
  assign_day_to_routine,
  find_days_assign_to_a_routine,
  remove_day_assigned_to_routine,
} = require("../controllers/day_controller");

const auth_middleware = require("../middlewares/auth_middleware");

const check_invalid_tokens_middleware = require("../middlewares/invalid_token_middleware");

//Routes

/**
 * GET route to find all days available
 *
 * @route {GET} /v1/day/
 *
 * @throws {CustomError} - If something goes wrong with the database
 */
router.get(
  "/",
  check_invalid_tokens_middleware,
  auth_middleware,
  cache_middleware,
  find_all_days
);

/**
 * POST route to scheduled a routine to a day
 *
 * @route {POST} /v1/day/scheduled
 * @body {number} id_routine. It is required
 * @body {number} id_day. It is required
 *
 * @throws {CustomError} - If the routine isn't found, if the day isn't found or
 * if something goes wrong while assigning the day
 */
router.post(
  "/scheduled",
  validate_fields_middleware.body_must_contain_attributes([
    "id_routine",
    "id_day",
  ]),
  check_invalid_tokens_middleware,
  auth_middleware,
  assign_day_to_routine
);

/**
 * GET route to find days assign to a routine
 *
 * @route {GET} /v1/day/routine/:id_routine
 *
 * @throws {CustomError} - If something goes wrong with the database
 */
router.get(
  "/routine/:id_routine",
  check_invalid_tokens_middleware,
  auth_middleware,
  cache_middleware,
  find_days_assign_to_a_routine
);

/**
 * DELETE route to unscheduled a day of a routine
 *
 * @route {DELETE} /v1/day/:id_day/routine/:id_routine
 *
 * @throws {CustomError} - If the day isn't found,
 * if the routine isn't found or if something goes wrong with the database
 */
router.delete(
  "/:id_day/routine/:id_routine",
  check_invalid_tokens_middleware,
  auth_middleware,
  remove_day_assigned_to_routine
);

//Exports

module.exports = router;
