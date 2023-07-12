//imports
const {
  create_new_routine,
  delete_routine_by_id_user_id_routine,
  delete_routines_by_id_user,
  find_routine_by_id_user_id_routine,
  find_routines_by_id_user,
  find_routines_of_exercise_by_id_user_idExercise,
  update_routine,
} = require("../repositories/routine_repository");
const CustomError = require("../utils/custom_error");
const {
  return_response,
  is_greater_than,
  are_equal,
} = require("../utils/utils_functions");
const _ = require("lodash");

//functions
/**
 * Controller that creates a new routine
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} if something goes wrong with database
 */
async function create_routine(req, res, next) {
  try {
    const { routine_name, time_before_start, description } = req.body;

    const new_routine = {
      id_user: req.id_user,
      routine_name: routine_name,
      time_before_start: time_before_start,
      description: description,
    };

    const created_routine = await create_new_routine(new_routine);

    if (are_equal(created_routine.length, 0)) {
      return next(
        new CustomError("Something went wrong. Routine not created", 500)
      );
    }

    return return_response(res, 201, "Routine created successfully", true);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that finds the routines of a user. It can be ordered
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} if something goes wrong with database
 */
async function find_routines(req, res, next) {
  try {
    const queries = Object.keys(req.query);
    if (is_greater_than(queries.length, 0)) {
      if (!req.query.sort_by || !req.query.order) {
        return next(
          new CustomError(
            "The allowed queries are sort_by and order, and they must be sent together or not send at all.",
            400
          )
        );
      }

      const allowed_sort_by_queries = [
        "routine_name",
        "created_at",
        "usage_routine",
      ];
      const allowed_order_queries = ["ASC", "DESC"];

      if (!allowed_sort_by_queries.includes(req.query.sort_by)) {
        return next(
          new CustomError(
            "The sort_by query only accepts 'routine_name', 'created_at' or 'usage_routine' as values",
            400
          )
        );
      }

      if (!allowed_order_queries.includes(req.query.order)) {
        return next(
          new CustomError(
            "The query order only accepts 'ASC' or 'DESC' as values",
            400
          )
        );
      }

      const found_routines = await find_routines_by_id_user(
        req.id_user,
        req.query.sort_by,
        req.query.order
      );

      return return_response(res, 200, found_routines, true);
    }

    const found_routines = await find_routines_by_id_user(req.id_user);

    return return_response(res, 200, found_routines, true);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that find a specific routine
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the routine isn't found or if something goes wrong with database
 */
async function find_specific_routine(req, res, next) {
  try {
    const found_routine = await find_routine_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    if (are_equal(found_routine.length, 0)) {
      next(new CustomError("Routine not found", 404));
    }

    return return_response(res, 200, found_routine[0], true);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that updates a specific routine
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the routine isn't found or if something goes wrong with database
 */
async function update_specific_routine(req, res, next) {
  try {
    if (!req.body) {
      return next(
        new CustomError("You must update, at least, one attribute", 400)
      );
    }

    const found_routine = await find_routine_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    if (are_equal(found_routine.length, 0)) {
      return next(new CustomError("Routine not found", 404));
    }

    const new_routine_information = {
      id_user: req.id_user,
      id_routine: found_routine[0].id_routine,
      routine_name: req.body.routine_name
        ? req.body.routine_name
        : found_routine[0].routine_name,
      usage_routine: req.body.usage_routine
        ? req.body.usage_routine
        : found_routine[0].usage_routine,
      time_before_start: req.body.time_before_start
        ? req.body.time_before_start
        : found_routine[0].time_before_start,
      description: req.body.description
        ? req.body.description
        : found_routine[0].description,
      is_favorite: req.body.is_favorite
        ? req.body.is_favorite
        : found_routine[0].is_favorite,
    };

    const updated_routine = await update_routine(new_routine_information);

    if (are_equal(updated_routine, 0)) {
      return next(new CustomError("Routine not updated", 500));
    }

    delete new_routine_information.id_user;

    return_response(res, 200, new_routine_information, true);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create_routine,
  find_routines,
  find_specific_routine,
  update_specific_routine,
};
