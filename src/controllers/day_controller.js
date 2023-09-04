//Imports
const redis = require("../config/redis_connection");

const {
  get_all_days,
  find_day_by_id_day,
} = require("../repositories/day_repository");

const {
  create_new_scheduled,
  delete_scheduled_by_id_user_id_routine_id_day,
  find_scheduled_by_id_user_id_routine,
  find_scheduled_by_id_user_id_routine_id_day,
} = require("../repositories/scheduled_repository");

const {
  find_routine_by_id_user_id_routine,
} = require("../repositories/routine_repository");

const CustomError = require("../utils/custom_error");

const {
  return_response,
  is_greater_than,
  are_equal,
} = require("../utils/utils_functions");

//Methods

/**
 * Controller that find all days available
 *
 * @param {Object} req - The request object from the HTTP request
 * @param {Object} res - The response object from the HTTP response
 * @param {Function} next - The next function in the middleware chain
 * @throws {CustomError} If something goes wrong with database
 */
async function find_all_days(req, res, next) {
  try {
    const found_days = await get_all_days();

    const key = req.originalUrl;

    if (found_days.length > 0) {
      const list = found_days.map((obj) => JSON.stringify(obj));

      await redis.lpush(key, list);
    }

    return return_response(res, 200, found_days, true);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that assign a day to a routine
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the routine isn't found, if the day isn't found,
 * if the assigment already exists, or if something goes wrong with
 * database
 */
async function assign_day_to_routine(req, res, next) {
  try {
    const { id_day, id_routine } = req.body;

    await find_routine_by_id_user_id_routine(req.id_user, id_routine);

    await find_day_by_id_day(id_day);

    const found_scheduled = await find_scheduled_by_id_user_id_routine_id_day(
      req.id_user,
      id_routine,
      id_day
    );

    if (is_greater_than(found_scheduled.length, 0)) {
      throw new CustomError(
        "The given routine is already assign to the given day",
        400
      );
    }

    const new_scheduled = {
      ...req.body,
      ...{ id_user: req.id_user },
    };

    await create_new_scheduled(new_scheduled);

    return return_response(
      res,
      201,
      { message: "Assignment done correctly" },
      true
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that find days assign to a routine
 *
 * @param {Object} req - The request object from the HTTP request
 * @param {Object} res - The response object from the HTTP response
 * @param {Function} next - The next function in the middleware chain
 * @throws {CustomError} If the routine isn't found or if something goes wrong with database
 */
async function find_days_assign_to_a_routine(req, res, next) {
  try {
    await find_routine_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    const found_days = await find_scheduled_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    const key = req.originalUrl;

    if (found_days.length > 0) {
      const list = found_days.map((obj) => JSON.stringify(obj));

      await redis.lpush(key, list);

      await redis.expire(key, 1);
    }

    return return_response(res, 200, found_days, true);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that unschedule a day of a routine
 *
 * @param {Object} req - The request object from the HTTP request
 * @param {Object} res - The response object from the HTTP response
 * @param {Function} next - The next function in the middleware chain
 * @throws {CustomError} If the routine isn't found, if the day isn't found,
 * if the assigment isn't found, or if something goes wrong with database
 */
async function remove_day_assigned_to_routine(req, res, next) {
  try {
    await find_routine_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    await find_day_by_id_day(req.params.id_day);

    const found_scheduled = await find_scheduled_by_id_user_id_routine_id_day(
      req.id_user,
      req.params.id_routine,
      req.params.id_day
    );

    if (are_equal(found_scheduled.length, 0)) {
      throw new CustomError("Assignment not found", 404);
    }

    await delete_scheduled_by_id_user_id_routine_id_day(
      req.id_user,
      req.params.id_routine,
      req.params.id_day
    );

    return return_response(res, 200, {
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

//Exports

module.exports = {
  find_all_days,
  assign_day_to_routine,
  find_days_assign_to_a_routine,
  remove_day_assigned_to_routine,
};
