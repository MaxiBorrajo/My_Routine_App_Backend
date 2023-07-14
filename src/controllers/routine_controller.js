//imports
const {
  create_new_routine,
  delete_routine_by_id_user_id_routine,
  delete_routines_by_id_user,
  find_routine_by_id_user_id_routine,
  find_routines_by_id_user,
  find_routines_by_id_user_isFavorite,
  find_routines_by_id_user_id_day,
  find_routines_of_exercise_by_id_user_idExercise,
  update_routine,
} = require("../repositories/routine_repository");

const {
  find_exercise_by_id_user_id_exercise,
} = require("../repositories/exercise_repository");

const {
  create_new_composed_by,
  find_composed_by_by_id_user_id_routine_id_exercise,
  update_composed_by,
  delete_composed_by_by_id_user_id_routine_id_exercise,
} = require("../repositories/composed_by_repository");

const {
  create_new_scheduled,
  delete_scheduled_by_id_user,
  delete_scheduled_by_id_user_id_routine,
  delete_scheduled_by_id_user_id_routine_id_day,
  find_scheduled_by_id_user_id_routine,
  find_scheduled_by_id_user_id_routine_id_day,
} = require("../repositories/scheduled_repository");

const { find_day_by_id_day } = require("../repositories/day_repository");

const CustomError = require("../utils/custom_error");

const {
  return_response,
  is_greater_than,
  are_equal,
} = require("../utils/utils_functions");

const _ = require("lodash");
const e = require("express");

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
 * Controller that finds all routines of a user. It can be ordered and filter
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If something goes wrong with database
 */
async function find_routines(req, res, next) {
  try {

    for (let query in req.query) {
      if (Array.isArray(req.query[query]) && query !== 'filter_values') {
        return next(new CustomError("Only one filter and one sort can be applied at a time", 400))
      } 
    }

    const allowed_sort_by_queries = [
      "routine_name",
      "created_at",
      "usage_routine",
    ];

    const allowed_order_queries = ["ASC", "DESC"];

    const allowed_filter_queries = ["day", "is_favorite"];

    if (req.query.sort_by && !req.query.order) {
      return next(
        new CustomError(
          "If you add sort_by you must also add the order with which to sort. You add it in the query as order",
          400
        )
      );
    }

    if (
      req.query.sort_by &&
      !allowed_sort_by_queries.includes(req.query.sort_by)
    ) {
      return next(
        new CustomError(
          "The sort_by query only accepts 'routine_name', 'created_at' or 'usage_routine' as values",
          400
        )
      );
    }

    if (req.query.order && !allowed_order_queries.includes(req.query.order)) {
      return next(
        new CustomError(
          "The query order only accepts 'ASC' or 'DESC' as values",
          400
        )
      );
    }

    if (
      req.query.filter &&
      !allowed_filter_queries.includes(req.query.filter)
    ) {
      return next(
        new CustomError(
          "The query filter only accepts 'day', or 'is_favorite' as values",
          400
        )
      );
    }

    if (req.query.filter && !req.query.filter_values) {
      return next(
        new CustomError(
          "If you add a filter you must also add the values with which to filter. You add them in the query as filter_values",
          400
        )
      );
    }

    if (req.query.filter && req.query.filter === "day") {
      const filter_values = req.query.filter_values.map((value) =>
        parseInt(value)
      );

      const found_routines = await find_routines_by_id_user_id_day(
        req.id_user,
        filter_values,
        req.query.sort_by,
        req.query.order
      );

      return return_response(res, 200, found_routines, true);
    }

    if (req.query.filter && req.query.filter === "is_favorite") {
      const filter_value = req.query.filter_values === "true";
      const found_routines = await find_routines_by_id_user_isFavorite(
        req.id_user,
        filter_value,
        req.query.sort_by,
        req.query.order
      );

      return return_response(res, 200, found_routines, true);
    }

    const found_routines = await find_routines_by_id_user(
      req.id_user,
      req.query.sort_by,
      req.query.order
    );

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

    return return_response(res, 200, new_routine_information, true);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that adds an exercise to a routine
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the routine isn't found, if the exercise isn't found,
 * if the composition already exists, or if something goes wrong with the
 * database
 */
async function add_exercise_to_routine(req, res, next) {
  try {
    const found_routine = await find_routine_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    if (are_equal(found_routine.length, 0)) {
      return next(new CustomError("Routine not found"));
    }

    const found_exercise = await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    if (are_equal(found_exercise.length, 0)) {
      return next(new CustomError("Exercise not found"));
    }

    const found_composed_by =
      await find_composed_by_by_id_user_id_routine_id_exercise(
        req.id_user,
        req.params.id_routine,
        req.params.id_exercise
      );

    if (is_greater_than(found_composed_by.length, 0)) {
      return next(
        new CustomError("The exercise already belongs to the given routine")
      );
    }

    const new_composed_by = {
      id_user: req.id_user,
      id_routine: req.params.id_routine,
      id_exercise: req.params.id_exercise,
      exercise_order: req.body.exercise_order,
    };

    const created_composed_by = await create_new_composed_by(new_composed_by);

    if (are_equal(created_composed_by, 0)) {
      return next(
        new CustomError("The exercise could not be added to the routine")
      );
    }

    return return_response(
      res,
      201,
      { message: "Exercise added successfully" },
      true
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that finds which routines are associated with an exercise
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the exercise isn't found or if something goes wrong with the
 * database
 */
async function find_routines_of_exercise(req, res, next) {
  try {
    const found_exercise = await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    if (are_equal(found_exercise.length, 0)) {
      return next(new CustomError("Exercise not found", 404));
    }

    const found_routines =
      await find_routines_of_exercise_by_id_user_idExercise(
        req.id_user,
        req.params.id_exercise
      );

    return return_response(res, 200, found_routines, true);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that change order of an exercise in a routine
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the routine isn't found, if the exercise isn't found,
 * if the composition isn't found, or if something goes wrong with the
 * database
 */
async function change_order_exercise_in_routine(req, res, next) {
  try {
    const found_routine = await find_routine_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    if (are_equal(found_routine.length, 0)) {
      return next(new CustomError("Routine not found"));
    }

    const found_exercise = await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    if (are_equal(found_exercise.length, 0)) {
      return next(new CustomError("Exercise not found"));
    }

    const found_composed_by =
      await find_composed_by_by_id_user_id_routine_id_exercise(
        req.id_user,
        req.params.id_routine,
        req.params.id_exercise
      );

    if (are_equal(found_composed_by.length, 0)) {
      return next(
        new CustomError(
          "The given exercise does not belong to the given routine"
        )
      );
    }

    const new_composed_by = {
      id_user: req.id_user,
      id_routine: req.params.id_routine,
      id_exercise: req.params.id_exercise,
      exercise_order: req.body.exercise_order,
    };

    const updated_composed_by = await update_composed_by(new_composed_by);

    if (are_equal(updated_composed_by, 0)) {
      return next(new CustomError("The order could not be changed"));
    }

    return return_response(
      res,
      201,
      { message: "Order changed successfully" },
      true
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that removes an exercise from a routine
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the routine isn't found, if the exercise isn't found,
 * if the composition isn't found, or if something goes wrong with the
 * database
 */
async function delete_exercise_from_routine(req, res, next) {
  try {
    const found_routine = await find_routine_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    if (are_equal(found_routine.length, 0)) {
      return next(new CustomError("Routine not found"));
    }

    const found_exercise = await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    if (are_equal(found_exercise.length, 0)) {
      return next(new CustomError("Exercise not found"));
    }

    const found_composed_by =
      await find_composed_by_by_id_user_id_routine_id_exercise(
        req.id_user,
        req.params.id_routine,
        req.params.id_exercise
      );

    if (are_equal(found_composed_by.length, 0)) {
      return next(
        new CustomError(
          "The given exercise does not belong to the given routine"
        )
      );
    }

    const deleted_composed_by =
      await delete_composed_by_by_id_user_id_routine_id_exercise(
        req.id_user,
        req.params.id_routine,
        req.params.id_exercise
      );

    if (are_equal(deleted_composed_by, 0)) {
      return next(new CustomError("Exercise could not be removed"));
    }

    return return_response(
      res,
      201,
      { message: "Exercise remove successfully" },
      true
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create_routine,
  find_routines,
  find_specific_routine,
  update_specific_routine,
  add_exercise_to_routine,
  find_routines_of_exercise,
  change_order_exercise_in_routine,
  delete_exercise_from_routine,
};
