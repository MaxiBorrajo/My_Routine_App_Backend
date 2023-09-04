//Imports
const redis = require("../config/redis_connection");

const {
  create_new_routine,
  delete_routine_by_id_user_id_routine,
  find_routine_by_id_user_id_routine,
  find_routines_by_id_user,
  find_routines_by_id_user_isFavorite,
  find_routines_by_id_user_id_day,
  find_routines_of_exercise_by_id_user_idExercise,
  update_routine,
  find_id_routine_of_last_routine_created_by_id_user,
} = require("../repositories/routine_repository");

const {
  find_exercise_by_id_user_id_exercise,
} = require("../repositories/exercise_repository");

const {
  create_new_composed_by,
  find_composed_by_by_id_user_id_routine_id_exercise,
  update_composed_by,
  delete_composed_by_by_id_user_id_routine_id_exercise,
  delete_composed_by_by_id_user_id_routine,
  find_amount_exercises_by_id_routine_id_user,
} = require("../repositories/composed_by_repository");

const {
  delete_scheduled_by_id_user_id_routine,
} = require("../repositories/scheduled_repository");

const CustomError = require("../utils/custom_error");

const {
  return_response,
  is_greater_than,
  are_equal,
} = require("../utils/utils_functions");

//Methods

/**
 * Controller that creates a new routine
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If something goes wrong with database
 */
async function create_routine(req, res, next) {
  try {
    const new_routine = { ...req.body, ...{ id_user: req.id_user } };

    await create_new_routine(new_routine);

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
 * @throws {CustomError} If you try to apply more than one filter and
 * sort at the same time, if you try to sort, but the order is not made explicit,
 * if you try to filter, but the filter values are not made explicit,
 * if you try to sort or filter by an attribute not allowed,
 * if the order is in an illegal way,
 * or if something goes wrong with database
 */
async function find_routines(req, res, next) {
  try {
    const key = req.originalUrl;

    for (let query in req.query) {
      if (Array.isArray(req.query[query]) && query !== "filter_values") {
        throw new CustomError(
          "Only one filter and one sort can be applied at a time",
          400
        );
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
      throw new CustomError(
        "If you add sort_by you must also add the order with which to sort. You add it in the query as order",
        400
      );
    }

    if (
      req.query.sort_by &&
      !allowed_sort_by_queries.includes(req.query.sort_by)
    ) {
      throw new CustomError(
        "The sort_by query only accepts 'routine_name', 'created_at' or 'usage_routine' as values",
        400
      );
    }

    if (req.query.order && !allowed_order_queries.includes(req.query.order)) {
      throw new CustomError(
        "The query order only accepts 'ASC' or 'DESC' as values",
        400
      );
    }

    if (
      req.query.filter &&
      !allowed_filter_queries.includes(req.query.filter)
    ) {
      throw new CustomError(
        "The query filter only accepts 'day', or 'is_favorite' as values",
        400
      );
    }

    if (req.query.filter && !req.query.filter_values) {
      throw new CustomError(
        "If you add a filter you must also add the values with which to filter. You add them in the query as filter_values",
        400
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

      if (found_routines.length > 0) {
        const list = found_routines.map((obj) => JSON.stringify(obj));

        await redis.lpush(key, list);

        await redis.expire(key, 1);
      }

      return return_response(res, 200, found_routines, true);
    }

    if (req.query.filter && req.query.filter === "is_favorite") {
      const filter_value = req.query.filter_values[0] === "true";

      const found_routines = await find_routines_by_id_user_isFavorite(
        req.id_user,
        filter_value,
        req.query.sort_by,
        req.query.order
      );

      if (found_routines.length > 0) {
        const list = found_routines.map((obj) => JSON.stringify(obj));

        await redis.lpush(key, list);

        await redis.expire(key, 1);
      }

      return return_response(res, 200, found_routines, true);
    }

    const found_routines = await find_routines_by_id_user(
      req.id_user,
      req.query.sort_by,
      req.query.order
    );

    if (found_routines.length > 0) {
      const list = found_routines.map((obj) => JSON.stringify(obj));

      await redis.lpush(key, list);

      await redis.expire(key, 1);
    }

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

    const key = req.originalUrl;

    await redis.set(key, JSON.stringify(found_routine[0]), "EX", 1);

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
 * @throws {CustomError} If the routine isn't found,
 * if no attribute is included in the body,
 * or if something goes wrong with database
 */
async function update_specific_routine(req, res, next) {
  try {
    if (are_equal(Object.keys(req.body).length, 0)) {
      throw new CustomError("You must update, at least, one attribute", 400);
    }

    const found_routine = await find_routine_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    const new_routine_information = {
      ...found_routine[0],
      ...req.body,
      ...{ id_user: req.id_user },
    };

    await update_routine(new_routine_information);

    return return_response(
      res,
      200,
      { message: "Routine updated successfully" },
      true
    );
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
    await find_routine_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    const found_composed_by =
      await find_composed_by_by_id_user_id_routine_id_exercise(
        req.id_user,
        req.params.id_routine,
        req.params.id_exercise
      );

    if (is_greater_than(found_composed_by.length, 0)) {
      throw new CustomError(
        "The exercise already belongs to the given routine",
        400
      );
    }

    const new_composed_by = {
      id_user: req.id_user,
      id_routine: req.params.id_routine,
      id_exercise: req.params.id_exercise,
      exercise_order: req.body.exercise_order,
    };

    await create_new_composed_by(new_composed_by);

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
    await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    const found_routines =
      await find_routines_of_exercise_by_id_user_idExercise(
        req.id_user,
        req.params.id_exercise
      );

    const key = req.originalUrl;

    if (found_routines.length > 0) {
      const list = found_routines.map((obj) => JSON.stringify(obj));

      await redis.lpush(key, list);

      await redis.expire(key, 1);
    }

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
    await find_routine_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    const found_composed_by =
      await find_composed_by_by_id_user_id_routine_id_exercise(
        req.id_user,
        req.params.id_routine,
        req.params.id_exercise
      );

    if (are_equal(found_composed_by.length, 0)) {
      throw new CustomError(
        "The given exercise does not belong to the given routine",
        400
      );
    }

    const new_composed_by = {
      id_user: req.id_user,
      id_routine: req.params.id_routine,
      id_exercise: req.params.id_exercise,
      exercise_order: req.body.exercise_order,
    };

    await update_composed_by(new_composed_by);

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
    await find_routine_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    const found_composed_by =
      await find_composed_by_by_id_user_id_routine_id_exercise(
        req.id_user,
        req.params.id_routine,
        req.params.id_exercise
      );

    if (are_equal(found_composed_by.length, 0)) {
      throw new CustomError(
        "The given exercise does not belong to the given routine",
        400
      );
    }

    await delete_composed_by_by_id_user_id_routine_id_exercise(
      req.id_user,
      req.params.id_routine,
      req.params.id_exercise
    );

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

/**
 * Controller that deletes a specific routine
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the routine isn't found or if something goes wrong with database
 */
async function delete_specific_routine(req, res, next) {
  try {
    await find_routine_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    await delete_scheduled_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    await delete_composed_by_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    await delete_routine_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    return return_response(
      res,
      200,
      {
        message: "Routine deleted successfully",
      },
      true
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that find the id of the last routine created
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If something goes wrong with database
 */
async function find_id_routine_of_last_routine_created(req, res, next) {
  try {
    const found_id = await find_id_routine_of_last_routine_created_by_id_user(
      req.id_user
    );

    return return_response(res, 200, found_id[0].max, true);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that find amount of exercises of a routine
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If something goes wrong with database
 */
async function find_amount_exercises_of_routine(req, res, next) {
  try {
    const found_amount = await find_amount_exercises_by_id_routine_id_user(
      req.id_user,
      req.params.id_routine
    );

    const key = req.originalUrl;

    await redis.set(key, JSON.stringify(found_amount[0].count), "EX", 1);

    return return_response(res, 200, found_amount[0].count, true);
  } catch (error) {
    next(error);
  }
}

//Exports

module.exports = {
  create_routine,
  find_routines,
  find_specific_routine,
  update_specific_routine,
  add_exercise_to_routine,
  find_routines_of_exercise,
  change_order_exercise_in_routine,
  delete_exercise_from_routine,
  delete_specific_routine,
  find_id_routine_of_last_routine_created,
  find_amount_exercises_of_routine,
};
