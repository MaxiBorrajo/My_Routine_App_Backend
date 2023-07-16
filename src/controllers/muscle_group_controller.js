//Imports

const {
  get_all_muscle_groups,
  find_muscle_group_by_id_muscle_group,
} = require("../repositories/muscle_group_repository");

const {
  create_new_works,
  delete_works_by_id_user_id_exercise_id_muscle_group,
  find_muscle_groups_by_id_user_id_exercise,
  find_muscle_group_by_id_user_id_exercise_id_muscle_group,
} = require("../repositories/works_repository");

const {
  find_exercise_by_id_user_id_exercise,
} = require("../repositories/exercise_repository");

const CustomError = require("../utils/custom_error");

const {
  return_response,
  is_greater_than,
  are_equal,
} = require("../utils/utils_functions");

//Imports

/**
 * Controller that find all muscle groups available
 *
 * @param {Object} req - The request object from the HTTP request
 * @param {Object} res - The response object from the HTTP response
 * @param {Function} next - The next function in the middleware chain
 * @throws {CustomError} If something goes wrong with database
 */
async function find_all_muscle_groups(req, res, next) {
  try {
    const found_muscle_groups = await get_all_muscle_groups();

    return return_response(res, 200, found_muscle_groups, true);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that assign a muscle group to an exercise
 *
 * @param {Object} req - The request object from the HTTP request
 * @param {Object} res - The response object from the HTTP response
 * @param {Function} next - The next function in the middleware chain
 * @throws {CustomError} If the exercise isn't found,
 * if the muscle group isn't found, if the muscle group is already associated
 * with the given exerciseor if something goes wrong with the database
 */
async function assign_muscle_group_to_exercise(req, res, next) {
  try {
    const { id_exercise, id_muscle_group } = req.body;

    await find_muscle_group_by_id_muscle_group(id_muscle_group);

    await find_exercise_by_id_user_id_exercise(req.id_user, id_exercise);

    const found_works =
      await find_muscle_group_by_id_user_id_exercise_id_muscle_group(
        req.id_user,
        id_exercise,
        id_muscle_group
      );

    if (is_greater_than(found_works.length, 0)) {
      throw new CustomError(
        "Muscle group is already associated to the exercise given",
        400
      );
    }

    const new_works = {
      id_user: req.id_user,
      id_exercise: id_exercise,
      id_muscle_group: id_muscle_group,
    };

    await create_new_works(new_works);

    return return_response(
      res,
      201,
      { message: "Association created successfully" },
      true
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that finds muscle groups assign to an exercise
 *
 * @param {Object} req - The request object from the HTTP request
 * @param {Object} res - The response object from the HTTP response
 * @param {Function} next - The next function in the middleware chain
 * @throws {CustomError} If the exercise isn't found
 * or if something goes wrong with the database
 */
async function find_muscle_groups_assign_to_exercise(req, res, next) {
  try {
    await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    const found_works = await find_muscle_groups_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    return return_response(res, 200, found_works, true);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that unassign a muscle group from an exercise
 *
 * @param {Object} req - The request object from the HTTP request
 * @param {Object} res - The response object from the HTTP response
 * @param {Function} next - The next function in the middleware chain
 * @throws {CustomError} If the exercise isn't found, if the muscle group
 * isn't found, if the association isn't found, or
 * if something goes wrong with the database
 */
async function unassign_muscle_group_from_exercise(req, res, next) {
  try {
    await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    await find_muscle_group_by_id_muscle_group(req.params.id_muscle_group);

    const found_works =
      await find_muscle_group_by_id_user_id_exercise_id_muscle_group(
        req.id_user,
        req.params.id_exercise,
        req.params.id_muscle_group
      );

    if (are_equal(found_works.length, 0)) {
      throw new CustomError(
        "Muscle group is not assigned to the given exercise",
        404
      );
    }

    await delete_works_by_id_user_id_exercise_id_muscle_group(
      req.id_user,
      req.params.id_exercise,
      req.params.id_muscle_group
    );

    return return_response(
      res,
      200,
      { message: "Muscle group unassigned successfully" },
      true
    );
  } catch (error) {
    next(error);
  }
}

//Exports

module.exports = {
  find_all_muscle_groups,
  assign_muscle_group_to_exercise,
  find_muscle_groups_assign_to_exercise,
  unassign_muscle_group_from_exercise,
};
