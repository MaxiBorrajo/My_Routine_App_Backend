//Imports

const express = require("express");

const router = express.Router();

const validate_fields_middleware = require("../middlewares/validate_fields_middleware");

const cache = require("../middlewares/cache_middleware");

const {
  find_all_muscle_groups,
  assign_muscle_group_to_exercise,
  find_muscle_groups_assign_to_exercise,
  unassign_muscle_group_from_exercise
} = require("../controllers/muscle_group_controller");

const auth_middleware = require("../middlewares/auth_middleware");

const check_invalid_tokens_middleware = require("../middlewares/invalid_token_middleware");

//Routes

/**
 * GET route to find all muscle_groups available
 *
 * @route {GET} /v1/muscle_group/
 *
 * @throws {CustomError} - If something goes wrong with the database
 */
router.get(
  "/",
  check_invalid_tokens_middleware,
  auth_middleware,
  cache(300),
  find_all_muscle_groups
);

/**
 * POST route to assign a muscle group to an exercise
 *
 * @route {POST} /v1/muscle_group/works
 * 
 * @body {number} id_exercise. It is required
 * @body {number} id_muscle_group. It is required
 *
 * @throws {CustomError} - If the exercise isn't found,
 * if the muscle group isn't found, or if something goes wrong with the database
 */
router.post(
  "/works",
  validate_fields_middleware.body_must_contain_attributes([
    "id_exercise",
    "id_muscle_group"
  ]),
  check_invalid_tokens_middleware,
  auth_middleware,
  assign_muscle_group_to_exercise
);

/**
 * GET route to find all muscle_groups assign to an exercise
 *
 * @route {GET} /v1/muscle_group/exercise/:id_exercise
 *
 * @throws {CustomError} - If something goes wrong with the database
 */
router.get(
  "/exercise/:id_exercise",
  check_invalid_tokens_middleware,
  auth_middleware,
  cache(300),
  find_muscle_groups_assign_to_exercise
);

/**
 * DELETE route to unassigned a muscle group from an exercise
 *
 * @route {DELETE} /v1/muscle_group/:id_muscle_group/exercise/:id_exercise
 *
 * @throws {CustomError} - If something goes wrong with the database
 */
router.delete(
  "/:id_muscle_group/exercise/:id_exercise",
  check_invalid_tokens_middleware,
  auth_middleware,
  unassign_muscle_group_from_exercise
);

//Exports

module.exports = router;
