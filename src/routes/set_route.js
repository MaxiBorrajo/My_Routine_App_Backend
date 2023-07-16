//Imports

const express = require("express");

const router = express.Router();

const validate_fields_middleware = require("../middlewares/validate_fields_middleware");

const { cache_middleware } = require("../middlewares/cache_middleware");

const {
  create_set,
  update_specific_set,
  find_all_sets_of_exercise,
  delete_specific_exercise,
} = require("../controllers/set_controller");

const auth_middleware = require("../middlewares/auth_middleware");

const check_invalid_tokens_middleware = require("../middlewares/invalid_token_middleware");

//Routes

/**
 * POST route to create a set associated to an exercise
 *
 * @route {POST} /v1/set
 * @body {number} id_exercise. It is required
 * @body {number} weight. It is required. Admits 5 digits and 2 decimals
 * @body {string} rest_after_set. It is required.  Must be like
 * ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * @body {number} set_order. It is required
 * @body {string} type. It is required. Must be 'repetition' or 'time'
 * @body {number | string} quantity. It is required.
 * if type is repetition, quantity must be an integer but if it is time,
 * must be an string like ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * @throws {CustomError} - If the exercise isn't found,
 * if any part of the body is missing, if the types and amounts are expressed wrong,
 * or if something goes wrong while creating the set
 */
router.post(
  "/",
  validate_fields_middleware.body_must_contain_attributes([
    "id_exercise",
    "weight",
    "rest_after_set",
    "set_order",
    "type",
    "quantity",
  ]),
  check_invalid_tokens_middleware,
  auth_middleware,
  create_set
);

/**
 * PUT route to update a specific set
 *
 * @route {PUT} /v1/set/:id_set/exercise/:id_exercise
 *
 * @body {number} weight. Admits 5 digits and 2 decimals
 * @body {string} rest_after_set. Must be like
 * ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * @body {number} set_order
 * @body {string} type. Must be 'repetition' or 'time'
 * @body {number | string} quantity. It is required if
 * type is present. If type is repetition, quantity must be an integer but if it is time,
 * must be an string like ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * @throws {CustomError} - If the exercise isn't found, if the set isn't found
 * if the types and amounts are expressed wrong,
 * or if something goes wrong while updating the set
 */
router.put(
  "/:id_set/exercise/:id_exercise",
  check_invalid_tokens_middleware,
  auth_middleware,
  update_specific_set
);

/**
 * GET route to find all sets of an exercise
 *
 * @route {GET} /v1/set/exercise/:id_exercise
 *
 * @throws {CustomError} - If something goes wrong with the database
 */
router.get(
  "/exercise/:id_exercise",
  check_invalid_tokens_middleware,
  auth_middleware,
  cache_middleware,
  find_all_sets_of_exercise
);

/**
 * DELETE route to delete a specific set
 *
 * @route {GET} /v1/set/:id_set/exercise/:id_exercise
 *
 * @throws {CustomError} - If the exercise isn't found, if the set isn't found,
 * of if something goes wrong with the database
 */
router.delete(
  "/:id_set/exercise/:id_exercise",
  check_invalid_tokens_middleware,
  auth_middleware,
  delete_specific_exercise
);

//Exports

module.exports = router;
