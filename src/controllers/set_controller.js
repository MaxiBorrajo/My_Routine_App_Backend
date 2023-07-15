const {
  create_new_set,
  delete_set_by_id_user_id_exercise_id_set,
  delete_sets_by_id_user,
  delete_sets_by_id_user_id_exercise,
  find_sets_by_id_user_id_exercise,
  update_set,
  find_id_set_of_last_set_created_by_id_user_id_exercise,
  find_set_by_id_user_id_exercise_id_set,
} = require("../repositories/set_repository");

const {
  create_new_repetition_set,
  delete_repetition_set_by_id_user_id_exercise_id_set,
  delete_repetition_sets_by_id_user,
  delete_repetition_sets_by_id_user_id_exercise,
  find_repetition_set_by_id_user_id_exercise_id_set,
  update_repetition_set,
} = require("../repositories/repetition_set_repository");

const {
  create_new_time_set,
  delete_time_set_by_id_user,
  delete_time_set_by_id_user_id_exercise,
  delete_time_set_by_id_user_id_exercise_id_set,
  find_time_set_by_id_user_id_exercise_id_set,
  update_time_set,
} = require("../repositories/time_set_repository");

const {
  find_exercise_by_id_user_id_exercise,
} = require("../repositories/exercise_repository");

const CustomError = require("../utils/custom_error");

const {
  return_response,
  is_greater_than,
  are_equal,
} = require("../utils/utils_functions");

/**
 * Controller that creates a new set associated to an exercise
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the exercise isn't found,
 * if any part of the body is missing, if the types and amounts are expressed wrong,
 * or if something goes wrong while creating the set
 */
async function create_set(req, res, next) {
  try {
    const { id_exercise, weight, rest_after_set, set_order, type, quantity } =
      req.body;

    const found_exercise = await find_exercise_by_id_user_id_exercise(
      req.id_user,
      id_exercise
    );

    if (are_equal(found_exercise.length, 0)) {
      return next(new CustomError("Exercise not found", 404));
    }

    if (type !== "time" && type !== "repetition") {
      return next(
        new CustomError(
          "The only two types allowed are 'time' and 'repetition'",
          400
        )
      );
    }

    if (type === "time" && typeof quantity !== "string") {
      return next(
        new CustomError("The type time allows values of type string", 400)
      );
    }

    if (type === "repetition" && typeof quantity !== "number") {
      return next(
        new CustomError("The type repetition allows values of type number", 400)
      );
    }

    const last_id_set =
      await find_id_set_of_last_set_created_by_id_user_id_exercise(
        req.id_user,
        id_exercise
      );

    const new_set = {
      id_user: req.id_user,
      id_exercise: id_exercise,
      id_set: last_id_set[0].max ? last_id_set[0].max + 1 : 1,
      weight: weight,
      rest_after_set: rest_after_set,
      set_order: set_order,
    };

    const created_set = await create_new_set(new_set);

    if (are_equal(created_set, 0)) {
      return next(new CustomError("The set could not be created", 500));
    }

    if (type === "repetition") {
      const new_repetition_set = {
        id_user: req.id_user,
        id_exercise: id_exercise,
        id_set: new_set.id_set,
        repetition: quantity,
      };

      const created_repetition_set = await create_new_repetition_set(
        new_repetition_set
      );

      if (are_equal(created_repetition_set, 0)) {
        await delete_set_by_id_user_id_exercise_id_set(
          req.id_user,
          id_exercise,
          new_set.id_set
        );
        return next(new CustomError("The set could not be created", 500));
      }
    } else {
      const new_time_set = {
        id_user: req.id_user,
        id_exercise: id_exercise,
        id_set: new_set.id_set,
        time: quantity,
      };

      const created_time_set = await create_new_time_set(new_time_set);

      if (are_equal(created_time_set, 0)) {
        await delete_set_by_id_user_id_exercise_id_set(
          req.id_user,
          id_exercise,
          new_set.id_set
        );
        return next(new CustomError("The set could not be created", 500));
      }
    }

    return return_response(
      res,
      201,
      { message: "Set created succesfully" },
      true
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that updates set associated to an exercise
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the exercise isn't found, if the set isn't found
 * if the types and amounts are expressed wrong,
 * or if something goes wrong while updating the set
 */
async function update_specific_set(req, res, next) {
  try {
    const found_exercise = await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    if (are_equal(found_exercise.length, 0)) {
      return next(new CustomError("Exercise not found", 404));
    }

    if (
      req.body.type &&
      req.body.type !== "time" &&
      req.body.type !== "repetition"
    ) {
      return next(
        new CustomError(
          "The only two types allowed are 'time' and 'repetition'",
          400
        )
      );
    }

    if (req.body.type && !req.body.quantity) {
      return next(
        new CustomError("If type is present you must add a quantity", 400)
      );
    }

    if (
      req.body.type &&
      req.body.type === "time" &&
      typeof req.body.quantity !== "string"
    ) {
      return next(
        new CustomError("The type time allows values of type string", 400)
      );
    }

    if (
      req.body.type &&
      req.body.type === "repetition" &&
      typeof req.body.quantity !== "number"
    ) {
      return next(
        new CustomError("The type repetition allows values of type number", 400)
      );
    }

    const found_set = await find_set_by_id_user_id_exercise_id_set(
      req.id_user,
      req.params.id_exercise,
      req.params.id_set
    );

    if (are_equal(found_set.length, 0)) {
      return next(new CustomError("Set not found", 404));
    }

    const new_information_set = {
      id_user: req.id_user,
      id_exercise: found_set[0].id_exercise,
      id_set: found_set[0].id_set,
      weight: req.body.weight ? req.body.weight : found_set[0].weight,
      rest_after_set: req.body.rest_after_set
        ? req.body.rest_after_set
        : found_set[0].rest_after_set,
      set_order: req.body.set_order
        ? req.body.set_order
        : found_set[0].set_order,
    };

    const updated_set = await update_set(new_information_set);

    if (are_equal(updated_set, 0)) {
      return next(new CustomError("The set could not be updated", 500));
    }

    if (req.body.type && req.body.type === "time") {
      const found_repetition_set =
        await find_repetition_set_by_id_user_id_exercise_id_set(
          req.id_user,
          found_set[0].id_exercise,
          found_set[0].id_set
        );

      if (is_greater_than(found_repetition_set.length, 0)) {
        await delete_repetition_set_by_id_user_id_exercise_id_set(
          req.id_user,
          found_set[0].id_exercise,
          found_set[0].id_set
        );

        const new_time_set = {
          id_user: req.id_user,
          id_exercise: found_set[0].id_exercise,
          id_set: found_set[0].id_set,
          time: req.body.quantity,
        };

        const created_time_set = await create_new_time_set(new_time_set);

        if (are_equal(created_time_set, 0)) {
          return next(
            new CustomError("The set could not be updated completly", 500)
          );
        }
      } else {
        const found_time_set =
          await find_time_set_by_id_user_id_exercise_id_set(
            req.id_user,
            found_set[0].id_exercise,
            found_set[0].id_set
          );

        found_time_set[0].time = req.body.quantity;

        const updated_time_set = await update_time_set(found_time_set[0]);

        if (are_equal(updated_time_set, 0)) {
          return next(
            new CustomError("The set could not be updated completly", 500)
          );
        }
      }
    }

    if (req.body.type && req.body.type === "repetition") {
      const found_time_set = await find_time_set_by_id_user_id_exercise_id_set(
        req.id_user,
        found_set[0].id_exercise,
        found_set[0].id_set
      );

      if (is_greater_than(found_time_set.length, 0)) {
        await delete_time_set_by_id_user_id_exercise_id_set(
          req.id_user,
          found_set[0].id_exercise,
          found_set[0].id_set
        );

        const new_repetition_set = {
          id_user: req.id_user,
          id_exercise: found_set[0].id_exercise,
          id_set: found_set[0].id_set,
          repetition: req.body.quantity,
        };

        const created_repetition_set = await create_new_repetition_set(
          new_repetition_set
        );

        if (are_equal(created_repetition_set, 0)) {
          return next(
            new CustomError("The set could not be updated completly", 500)
          );
        }
      } else {
        const found_repetition_set =
          await find_repetition_set_by_id_user_id_exercise_id_set(
            req.id_user,
            found_set[0].id_exercise,
            found_set[0].id_set
          );

        found_repetition_set[0].repetition = req.body.quantity;

        const updated_repetition_set = await update_repetition_set(
          found_repetition_set[0]
        );

        if (are_equal(updated_repetition_set, 0)) {
          return next(
            new CustomError("The set could not be updated completly", 500)
          );
        }
      }
    }

    return return_response(
      res,
      200,
      { message: "Set updated succesfully" },
      true
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that finds all sets associated to an exercise
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the exercise isn't found or
 * if something goes wrong while updating the set
 */
async function find_all_sets_of_exercise(req, res, next) {
  const found_exercise = await find_exercise_by_id_user_id_exercise(
    req.id_user,
    req.params.id_exercise
  );

  if (are_equal(found_exercise.length, 0)) {
    return next(new CustomError("Exercise not found", 404));
  }

  const found_sets = await find_sets_by_id_user_id_exercise(
    req.id_user,
    req.params.id_exercise
  );

  return return_response(res, 200, found_sets, true);
}

/**
 * Controller that deletes a specific set
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the exercise isn't found, if the set isn't found,
 * of if something goes wrong with the database
 */
async function delete_specific_exercise(req, res, next) {
  const found_exercise = await find_exercise_by_id_user_id_exercise(
    req.id_user,
    req.params.id_exercise
  );

  if (are_equal(found_exercise.length, 0)) {
    return next(new CustomError("Exercise not found", 404));
  }

  const found_set = await find_set_by_id_user_id_exercise_id_set(
    req.id_user,
    req.params.id_exercise,
    req.params.id_set
  );

  if (are_equal(found_set.length, 0)) {
    return next(new CustomError("Set not found", 404));
  }

  await delete_repetition_set_by_id_user_id_exercise_id_set(
    req.id_user,
    req.params.id_exercise,
    req.params.id_set
  );

  await delete_time_set_by_id_user_id_exercise_id_set(
    req.id_user,
    req.params.id_exercise,
    req.params.id_set
  );

  const deleted_set = await delete_set_by_id_user_id_exercise_id_set(
    req.id_user,
    req.params.id_exercise,
    req.params.id_set
  );

  if (are_equal(deleted_set, 0)) {
    return next(new CustomError("Set could not deleted", 500));
  }

  return return_response(
    res,
    200,
    { message: "Set deleted succesfully" },
    true
  );
}

module.exports = {
  create_set,
  update_specific_set,
  find_all_sets_of_exercise,
  delete_specific_exercise,
};
