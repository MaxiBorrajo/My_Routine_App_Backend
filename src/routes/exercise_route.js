//Imports

const express = require("express");

const router = express.Router();

const { cache_middleware } = require("../middlewares/cache_middleware");

const validate_fields_middleware = require("../middlewares/validate_fields_middleware");

const {
  create_exercise,
  find_all_exercises,
  find_exercises_of_routine,
  update_specific_exercise,
  find_specific_exercise,
  delete_specific_exercise,
  find_id_exercise_of_last_exercise_created,
  find_amount_muscle_groups_of_exercise,
  find_amount_time_sets_of_exercise,
  find_amount_repetition_sets_of_exercise,
  find_amount_routines_of_exercise,
} = require("../controllers/exercise_controller");

const auth_middleware = require("../middlewares/auth_middleware");

//Routes

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
    "intensity",
  ]),
  auth_middleware,
  create_exercise
);

/**
 * GET route to find all exercises of a user
 *
 * @route {GET} /v1/exercise/
 * @query sort_by (optional) - The attribute by which to order,
 * can be by exercise_name, created_at, or intensity. If you add sort_by must add an order too
 * @query order (optional) - In which order to do it, ascending, ASC should be written or descending,
 * DESC should be written
 * @query filter (optional) - The attribute by which to filter, can be by intensity, muscle_group
 * or is_favorite. If you add filter must add filter_values too
 * @query filter_values (optional) - The values by which to filter, if it is by muscle group
 * you must add an array with the ids of those muscle groups, if it is by intensity you must
 * add an array with the integers that represent the different intensities,
 * and if by is_favorite you must put either true or false as value
 *
 * @throws {CustomError} - If the queries bring illegal values or if something goes wrong
 * with the database
 */
router.get(
  "/",
  auth_middleware,
  cache_middleware,
  find_all_exercises
);

/**
 * GET route to get the id_exercise of the last exercise created
 *
 * @route {GET} /v1/exercise/last
 *
 * @throws {CustomError} - If something goes wrong with the database
 */
router.get(
  "/last",
  auth_middleware,
  cache_middleware,
  find_id_exercise_of_last_exercise_created
);

/**
 * GET route to find all exercises of a routine
 *
 * @route {GET} /v1/exercise/routine/:id_routine
 *
 * @query sort_by (optional) - The attribute by which to order,
 * can be by exercise_name, created_at, or intensity. If you add sort_by must add an order too
 * @query order (optional) - In which order to do it, ascending, ASC should be written or descending,
 * DESC should be written
 * @query filter (optional) - The attribute by which to filter, can be by intensity, muscle_group
 * or is_favorite. If you add filter must add filter_values too
 * @query filter_values (optional) - The values by which to filter, if it is by muscle group
 * you must add an array with the ids of those muscle groups, if it is by intensity you must
 * add an array with the integers that represent the different intensities,
 * and if by is_favorite you must put either true or false as value
 *
 * @throws {CustomError} - If the routine isn't found or if something goes wrong with the
 * database
 */
router.get(
  "/routine/:id_routine",
  auth_middleware,
  cache_middleware,
  find_exercises_of_routine
);

/**
 * GET route to find a specific exercise
 *
 * @route {GET} /v1/exercise/:id_exercise
 *
 * @throws {CustomError} - If the exercise isn't found or if something goes wrong with the database
 */
router.get(
  "/:id_exercise",
  auth_middleware,
  cache_middleware,
  find_specific_exercise
);

/**
 * GET route to find amount of time sets of an exercise
 *
 * @route {GET} /v1/exercise/:id_exercise/amount/time_set
 *
 * @throws {CustomError} - If the exercise isn't found or if something goes wrong with the database
 */
router.get(
  "/:id_exercise/amount/time_set",
  auth_middleware,
  cache_middleware,
  find_amount_time_sets_of_exercise
);

/**
 * GET route to find amount of repetition sets of an exercise
 *
 * @route {GET} /v1/exercise/:id_exercise/amount/repetition_set
 *
 * @throws {CustomError} - If the exercise isn't found or if something goes wrong with the database
 */
router.get(
  "/:id_exercise/amount/repetition_set",
  auth_middleware,
  cache_middleware,
  find_amount_repetition_sets_of_exercise
);

/**
 * GET route to find amount of muscle groups assigned to an exercise
 *
 * @route {GET} /v1/exercise/:id_exercise/amount/muscle_group
 *
 * @throws {CustomError} - If the exercise isn't found or if something goes wrong with the database
 */
router.get(
  "/:id_exercise/amount/muscle_group",
  auth_middleware,
  cache_middleware,
  find_amount_muscle_groups_of_exercise
);

/**
 * GET route to find amount of routines of an exercise
 *
 * @route {GET} /v1/exercise/:id_exercise/amount/routines
 *
 * @throws {CustomError} - If the exercise isn't found or if something goes wrong with the database
 */
router.get(
  "/:id_exercise/amount/routines",
  auth_middleware,
  cache_middleware,
  find_amount_routines_of_exercise
);

/**
 * Updates a specific exercise
 *
 * @route {PUT} /v1/exercise/:id_exercise
 *
 * Attributes allowed to change
 * @body {String} exercise_name
 * @body {String} time_after_exercise. Must be like ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * @body {String} description
 * @body {Boolean} is_favorite
 * @body {number} intensity - Must be 1 (low), 2 (mid), or 3 (high)
 *
 * @throws {CustomError} - If the exercise isn't found in database, if there is no body
 * or if something goes wrong with the database
 */
router.put(
  "/:id_exercise",
  auth_middleware,
  update_specific_exercise
);

/**
 * Deletes a specific exercise
 *
 * @route {DELETE} /v1/exercise/:id_exercise
 *
 * @throws {CustomError} - If the exercise isn't found in database or
 * if something goes wrong with the database
 */
router.delete(
  "/:id_exercise",
  auth_middleware,
  delete_specific_exercise
);

//Exports

module.exports = router;
