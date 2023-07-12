const {
  create_new_exercise,
  delete_exercise_by_id_user_id_exercise,
  delete_exercises_by_id_user,
  find_exercise_by_id_user_idRoutine,
  find_exercise_by_id_user_id_exercise,
  find_exercises_by_id_user,
  find_exercises_by_id_user_idMuscleGroup,
  find_exercises_by_id_user_intensity,
  update_exercise,
} = require("../repositories/exercise_repository");
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
      const { exercise_name, time_after_exercise, description, intensity } = req.body;
  
      const new_exercise = {
        id_user: req.id_user,
        exercise_name: exercise_name,
        time_after_exercise: time_after_exercise,
        description: description,
        intensity: intensity
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

module.exports = {
  create_exercise,
};
