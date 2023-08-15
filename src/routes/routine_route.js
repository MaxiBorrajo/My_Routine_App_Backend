//Imports

const express = require("express");

const router = express.Router();

const validate_fields_middleware = require("../middlewares/validate_fields_middleware");

const { cache_middleware } = require("../middlewares/cache_middleware");

const {
  create_routine,
  find_routines,
  find_specific_routine,
  update_specific_routine,
  add_exercise_to_routine,
  find_routines_of_exercise,
  change_order_exercise_in_routine,
  delete_exercise_from_routine,
  delete_specific_routine,
  find_id_routine_of_last_routine_created
} = require("../controllers/routine_controller");

const auth_middleware = require("../middlewares/auth_middleware");

const check_invalid_tokens_middleware = require("../middlewares/invalid_token_middleware");

//Routes

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
 * GET route to find all routines of a user
 *
 * @route {GET} /v1/routine/
 * @query sort_by (optional) - The attribute by which to order, can be by routine_name, created_at or usage_routine
 * @query order (optional) - In which order to do it, ascending, ASC should be written or descending,
 * DESC should be written
 * @query filter (optional) - The attribute by which to filter, can be by day or is_favorite.
 * If you add filter must add filter_values too
 * @query filter_values (optional) - The values by which to filter, if it is by a day
 * you must add an array with the ids of those days or if it is by is_favorite
 * you must put either true or false as value
 * @throws {CustomError} - If the queries bring illegal values or if something goes wrong
 * with the database
 */
router.get(
  "/",
  check_invalid_tokens_middleware,
  auth_middleware,
  cache_middleware,
  find_routines
);

/**
 * GET route to get the id_routine of the last routine created
 *
 * @route {GET} /v1/routine/last
 *
 * @throws {CustomError} - If something goes wrong with the database
 */
router.get(
  "/last",
  check_invalid_tokens_middleware,
  auth_middleware,
  cache_middleware,
  find_id_routine_of_last_routine_created
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
  cache_middleware,
  find_specific_routine
);

/**
 * Updates a specific routine
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

/**
 * POST route to add an exercise to a routine
 *
 * @route {POST} /v1/routine/:id_routine/exercise/:id_exercise
 * @body {number} exercise_order - The position that the exercise occupy. Is required
 *
 * @throws {CustomError} - If attributes of the body don't match the requirements specified before
 * or if there is an error while adding the exercise
 */
router.post(
  "/:id_routine/exercise/:id_exercise",
  validate_fields_middleware.body_must_contain_attributes(["exercise_order"]),
  check_invalid_tokens_middleware,
  auth_middleware,
  add_exercise_to_routine
);

/**
 * GET route to see which routines a specific exercise belongs to
 *
 * @route {GET} /v1/routine/exercise/:id_exercise
 *
 * @throws {CustomError} - If something goes wrong with the database
 */
router.get(
  "/exercise/:id_exercise",
  check_invalid_tokens_middleware,
  auth_middleware,
  cache_middleware,
  find_routines_of_exercise
);

/**
 * PUT route to change the order of an exercise in a routine
 *
 * @route {PUT} /v1/routine/:id_routine/exercise/:id_exercise
 * @body {number} exercise_order - The position that the exercise occupy. Is required
 *
 * @throws {CustomError} - If attributes of the body don't match the requirements specified before
 * or if there is an error while changing the order
 */
router.put(
  "/:id_routine/exercise/:id_exercise",
  validate_fields_middleware.body_must_contain_attributes(["exercise_order"]),
  check_invalid_tokens_middleware,
  auth_middleware,
  change_order_exercise_in_routine
);

/**
 * DELETE route to remove an exercise from a routine
 *
 * @route {DELETE} /v1/routine/:id_routine/exercise/:id_exercise
 *
 * @throws {CustomError} - If something goes wrong while removing the exercise
 */
router.delete(
  "/:id_routine/exercise/:id_exercise",
  check_invalid_tokens_middleware,
  auth_middleware,
  delete_exercise_from_routine
);

/**
 * Deletes a specific routine
 *
 * @route {DELETE} /v1/routine/:id_routine
 *
 * @throws {CustomError} - If the routine isn't found in database or
 * if something goes wrong with the database
 */
router.delete(
  "/:id_routine",
  check_invalid_tokens_middleware,
  auth_middleware,
  delete_specific_routine
);



//Exports

module.exports = router;
