const {
  get_all_days,
  find_day_by_id_day,
} = require("../repositories/day_repository");
const {
  create_new_scheduled,
  delete_scheduled_by_id_user,
  delete_scheduled_by_id_user_id_routine,
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
 * if the assigment already exists, or if something goes wrong with the
 * database
 */
async function assign_day_to_routine(req, res, next) {
  try {
    const { id_day, id_routine } = req.body;

    const found_routine = await find_routine_by_id_user_id_routine(
      req.id_user,
      id_routine
    );

    if (are_equal(found_routine.length, 0)) {
      return next(new CustomError("Routine not found", 404));
    }

    const found_day = await find_day_by_id_day(id_day);

    if (are_equal(found_day.length, 0)) {
      return next(new CustomError("Day not found", 404));
    }

    const found_scheduled = await find_scheduled_by_id_user_id_routine_id_day(
      req.id_user,
      id_routine,
      id_day
    );

    if (is_greater_than(found_scheduled.length, 0)) {
      return next(
        new CustomError("The given routine is already assign to the given day", 400)
      );
    }

    const new_scheduled = {
      id_user: req.id_user,
      id_routine: id_routine,
      id_day: id_day,
    };

    const created_scheduled = await create_new_scheduled(new_scheduled);

    if (are_equal(created_scheduled, 0)) {
      return next(new CustomError("The assignment could not be done", 500));
    }

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
    const found_routine = await find_routine_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    if (are_equal(found_routine.length, 0)) {
      return next(new CustomError("Routine not found", 404));
    }

    const found_days = await find_scheduled_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

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
 * @throws {CustomError} If the routine isn't found or if something goes wrong with database
 */
async function remove_day_assigned_to_routine(req, res, next) {
  try {
    const found_routine = await find_routine_by_id_user_id_routine(
      req.id_user,
      req.params.id_routine
    );

    if (are_equal(found_routine.length, 0)) {
      return next(new CustomError("Routine not found", 404));
    }

    const found_day = await find_day_by_id_day(req.params.id_day);

    if (are_equal(found_day.length, 0)) {
      return next(new CustomError("Day not found", 404));
    }

    const found_scheduled = await find_scheduled_by_id_user_id_routine_id_day(
      req.id_user,
      req.params.id_routine,
      req.params.id_day
    );

    if (are_equal(found_scheduled.length, 0)) {
      return next(new CustomError("Assignment not found", 404));
    }

    const deleted_scheduled =
      await delete_scheduled_by_id_user_id_routine_id_day(
        req.id_user,
        req.params.id_routine,
        req.params.id_day
      );

    if (are_equal(deleted_scheduled, 0)) {
      return next(new CustomError("Assignment could not be deleted", 500));
    }

    return return_response(res, 200, {
      message: "Assignment deleted succesfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  find_all_days,
  assign_day_to_routine,
  find_days_assign_to_a_routine,
  remove_day_assigned_to_routine,
};
