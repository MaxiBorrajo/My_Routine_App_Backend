const {
  create_new_exercise,
  delete_exercise_by_id_user_id_exercise,
  delete_exercises_by_id_user,
  find_exercise_by_id_user_idRoutine,
  find_exercise_by_id_user_id_exercise,
  find_exercises_by_id_user_isFavorite,
  find_exercises_by_id_user,
  find_exercises_by_id_user_idMuscleGroup,
  find_exercises_by_id_user_intensity,
  update_exercise,
} = require("../repositories/exercise_repository");
const {
  find_routine_by_id_user_id_routine,
} = require("../repositories/routine_repository");
const CustomError = require("../utils/custom_error");
const {
  return_response,
  is_greater_than,
  are_equal,
} = require("../utils/utils_functions");
const _ = require("lodash");

/**
 * Controller that creates a new exercise
 *
 * @param {Object} req - The request object from the HTTP request
 * @param {Object} res - The response object from the HTTP response
 * @param {Function} next - The next function in the middleware chain
 * @throws {CustomError} If something goes wrong with database
 */
async function create_exercise(req, res, next) {
  try {
    const { exercise_name, time_after_exercise, description, intensity } =
      req.body;

    const new_exercise = {
      id_user: req.id_user,
      exercise_name: exercise_name,
      time_after_exercise: time_after_exercise,
      description: description,
      intensity: intensity,
    };

    const created_exercise = await create_new_exercise(new_exercise);

    if (are_equal(created_exercise.length, 0)) {
      return next(
        new CustomError("Something went wrong. Exercise not created", 500)
      );
    }

    return return_response(res, 201, "Exercise created successfully", true);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that finds all exercises of a user. It can be ordered and filter
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If something goes wrong with database
 */
async function find_all_exercises(req, res, next) {
  try {
    
    for (let query in req.query) {
      if (Array.isArray(req.query[query]) && query !== 'filter_values') {
        return next(new CustomError("Only one filter and one sort can be applied at a time", 400))
      } 
    }

    const allowed_sort_by_queries = [
      "exercise_name",
      "created_at",
      "intensity",
    ];

    const allowed_order_queries = ["ASC", "DESC"];

    const allowed_filter_queries = ["intensity", "muscle_group", "is_favorite"];

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
          "The sort_by query only accepts 'exercise_name', 'created_at' or 'intensity' as values",
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
          "The query filter only accepts 'intensity', 'muscle_group', or 'is_favorite' as values",
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

    if (req.query.filter && req.query.filter === "muscle_group") {
      const filter_values = req.query.filter_values.map((value) =>
        parseInt(value)
      );

      const found_exercises = await find_exercises_by_id_user_idMuscleGroup(
        req.id_user,
        filter_values,
        req.query.sort_by,
        req.query.order
      );

      return return_response(res, 200, found_exercises, true);
    }

    if (req.query.filter && req.query.filter === "intensity") {
      const filter_values = parseInt(req.query.filter_values)

      const found_exercises = await find_exercises_by_id_user_intensity(
        req.id_user,
        filter_values,
        req.query.sort_by,
        req.query.order
      );

      return return_response(res, 200, found_exercises, true);
    }

    if (req.query.filter && req.query.filter === "is_favorite") {
      const filter_value = req.query.filter_values === "true";
      const found_exercises = await find_exercises_by_id_user_isFavorite(
        req.id_user,
        filter_value,
        req.query.sort_by,
        req.query.order
      );

      return return_response(res, 200, found_exercises, true);
    }

    const found_exercises = await find_exercises_by_id_user(
      req.id_user,
      req.query.sort_by,
      req.query.order
    );

    return return_response(res, 200, found_exercises, true);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that finds which exercises are associated with a routine
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the routine isn't found or if something goes wrong with the
 * database
 */
async function find_exercises_of_routine(req, res, next) {
  try {
    const found_routine = await find_routine_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    if (are_equal(found_routine.length, 0)) {
      return next(new CustomError("Routine not found", 404));
    }

    const found_routines = await find_exercise_by_id_user_idRoutine(
      req.id_user,
      req.params.id_routine
    );

    return return_response(res, 200, found_routines, true);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that updates a specific exercise
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the exercise isn't found or if something goes wrong with database
 */
async function update_specific_exercise(req, res, next) {
  try {
    if (!req.body) {
      return next(
        new CustomError("You must update, at least, one attribute", 400)
      );
    }

    const found_exercise = await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    if (are_equal(found_exercise.length, 0)) {
      return next(new CustomError("Exercise not found", 404));
    }

    const new_exercise_information = {
      id_user: req.id_user,
      id_exercise: found_exercise[0].id_exercise,
      exercise_name: req.body.exercise_name
        ? req.body.exercise_name
        : found_exercise[0].exercise_name,
      time_after_exercise: req.body.time_after_exercise
        ? req.body.time_after_exercise
        : found_exercise[0].time_after_exercise,
      description: req.body.description
        ? req.body.description
        : found_exercise[0].description,
      is_favorite: req.body.is_favorite
        ? req.body.is_favorite
        : found_exercise[0].is_favorite,
      intensity: req.body.intensity
        ? req.body.intensity
        : found_exercise[0].intensity,
    };

    const updated_exercise = await update_exercise(new_exercise_information);

    if (are_equal(updated_exercise, 0)) {
      return next(new CustomError("Routine not updated", 500));
    }

    delete new_exercise_information.id_user;

    return return_response(res, 200, new_exercise_information, true);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that find a specific exercise
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the exercise isn't found or if something goes wrong with database
 */
async function find_specific_exercise(req, res, next) {
  try {
    const found_exercise = await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    if (are_equal(found_exercise.length, 0)) {
      next(new CustomError("Exercise not found", 404));
    }

    return return_response(res, 200, found_exercise[0], true);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create_exercise,
  find_all_exercises,
  find_exercises_of_routine,
  find_specific_exercise,
  update_specific_exercise,
};
