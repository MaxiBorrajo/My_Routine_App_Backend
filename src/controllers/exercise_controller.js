const { pool } = require("../config/db_connection");
const CustomError = require("../utils/custom_error");

/**
 * Creates a new exercise
 * @param {Object} exercise - Object that contains information about the exercise entity.
 * It must contain:
 * exercise.id_user {number} - User's id. Must be stored in database and be an integer.
 * exercise.exercise_name {string} - Name of the exercise
 * exercise.intensity {number} - Intensity of the exercise 1 (low), 2 (mid), 3 (high)
 * exercise.description {string} - A description of the exercise
 * exercise.time_after_exercise {string} - The time of rest after a exercise ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * @returns {Promise<Object>} - A promise of the created exercise
 * @throws {CustomError} - If something goes wrong with the database
 */
async function create_new_exercise(exercise) {
  try {
    const { id_user, exercise_name, intensity, description, time_after_exercise } =
      exercise;

    const new_exercise = await pool.query(
      `
        INSERT INTO EXERCISE 
        (id_user, exercise_name,
         intensity, 
         description, time_after_exercise) VALUES 
        ($1, $2, $3, $4, $5); 
        `,
      [id_user, exercise_name, intensity, description, time_after_exercise]
    );
    return new_exercise.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Finds exercises by id_user. It can be ordered
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {string} sort_by - Attribute of an exercise by which to order the results
 * @param {string} order - ASC (ascending) or DESC (descending)
 * @returns {Promise<Object>} - A promise of the found exercises
 * @throws {CustomError} - If something goes wrong with the database
 */
async function find_exercises_by_id_user(id_user, sort_by, order) {
  try {
    let query = `
    SELECT e.* FROM EXERCISE AS e
    WHERE e.id_user = $1
  `;
    query += sort_by && order ? `ORDER BY ${sort_by} ${order}` : "";
    const found_exercises = await pool.query(query, [id_user]);
    return found_exercises.rows;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Finds exercises by id_user and idMuscleGroup. It can be ordered
 * @param {number} id_user - User's id. It must be an integer and be store in database
 * @param {number[]} muscle_groups - Array of muscle group's id. They must be an integer
 * and be store in database
 * @param {string} sort_by - Attribute of an exercise by which to order the results
 * @param {string} order - ASC (ascending) or DESC (descending)
 * @returns {Promise<Object>} - A promise of the found exercises
 * @throws {CustomError} - If something goes wrong with the database
 */
async function find_exercises_by_id_user_idMuscleGroup(
  id_user,
  muscle_groups,
  sort_by,
  order
) {
  try {
    let query = `
    SELECT DISTINCT e.* FROM EXERCISE AS e
    JOIN WORKS w ON e.id_user = w.id_user 
    AND e.id_exercise = w.id_exercise
    WHERE e.id_user = $1 AND (
  `;

    let params = [id_user];

    if (muscle_groups.length > 0) {
      muscle_groups.forEach((id_muscle_group, index) => {
        if (index === muscle_groups.length - 1) {
          query += `w.id_muscle_group = $${index + 2})\n`;
        } else {
          query += `w.id_muscle_group = $${index + 2} OR\n`;
        }
        params.push(id_muscle_group);
      });
    }
    query += sort_by && order ? `ORDER BY ${sort_by} ${order}` : "";
    const found_exercises = await pool.query(query, params);
    return found_exercises.rows;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Finds exercises by id_user and intensity. It can be ordered
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number[]} intensities - Array of intensities of the exercise. 1 (low), 2 (mid), 3 (high)
 * @param {string} sort_by - Attribute of an exercise by which to order the results
 * @param {string} order - ASC (ascending) or DESC (descending)
 * @returns {Promise<Object>} - A promise of the found exercises
 * @throws {CustomError} - If something goes wrong with the database
 */
async function find_exercises_by_id_user_intensity(
  id_user,
  intensities,
  sort_by,
  order
) {
  try {
    let query = `
    SELECT DISTINCT e.* FROM EXERCISE AS e
    WHERE e.id_user = $1 AND (
  `;
    let params = [id_user];

    if (intensities.length > 0) {
      intensities.forEach((intensity, index) => {
        if (index === intensities.length - 1) {
          query += `e.intensity = $${index + 2})\n`;
        } else {
          query += `e.intensity = $${index + 2} OR\n`;
        }
        params.push(intensity);
      });
    }
    query += sort_by && order ? `ORDER BY ${sort_by} ${order}` : "";
    const found_exercises = await pool.query(query, params);
    return found_exercises.rows;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Finds a specific exercise by id_user and id_exercise
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found exercise
 * @throws {CustomError} - If something goes wrong with the database
 */
async function find_exercise_by_id_user_id_exercise(id_user, id_exercise) {
  try {
    const found_exercise = await pool.query(
      `
      SELECT * FROM EXERCISE AS e
      WHERE e.id_user = $1 AND e.id_exercise = $2
      `,
      [id_user, id_exercise]
    );
    return found_exercise.rows;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Updates a specific exercise
 * @param {Object} exercise - Object that contains information about the exercise entity. It must contain:
 * exercise.id_user {number} - User's id. Must be stored in database and be an integer.
 * exercise.id_exercise {number} - Exercise's id. Must be stored in database and be an integer.
 * exercise.exercise_name {string} - Name of the exercise
 * exercise.intensity {number} - Intensity of the exercise 1 (low), 2 (mid), 3 (high)
 * exercise.is_favorite {boolean} - If the exercise is a favorite one or not
 * exercise.description {string} - A description of the exercise
 * exercise.time_after_exercise {string} - The time of rest after a exercise ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * @returns {Promise<Object>} - A promise of the updated exerise.
 * @throws {CustomError} - If something goes wrong with the database
 */
async function update_exercise(exercise) {
  try {
    const {
      id_user,
      id_exercise,
      exercise_name,
      intensity,
      is_favorite,
      description,
      time_after_exercise,
    } = exercise;

    const updated_exercise = await pool.query(
      `
    UPDATE EXERCISE
    SET exercise_name = $3, intensity = $4,
    is_favorite = $5, description = $6,
    time_after_exercise = $7
    WHERE id_user = $1 AND id_exercise = $2
    `,
      [
        id_user,
        id_exercise,
        exercise_name,
        intensity,
        is_favorite,
        description,
        time_after_exercise,
      ]
    );
    return updated_exercise.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Delete a specific exercise of a user by their id
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted exercise
 * @throws {CustomError} - If something goes wrong with the database
 */
async function delete_exercise_by_id_user_id_exercise(id_user, id_exercise) {
  try {
    const deleted_exercise = await pool.query(
      `
      DELETE FROM EXERCISE AS e
      WHERE e.id_user = $1 AND e.id_exercise = $2
      `,
      [id_user, id_exercise]
    );
    return deleted_exercise.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Delete all exercises by id_user
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted exercises
 * @throws {CustomError} - If something goes wrong with the database
 */
async function delete_exercises_by_id_user(id_user) {
  try {
    const deleted_exercises = await pool.query(
      `
      DELETE FROM EXERCISE AS e
      WHERE e.id_user = $1
      `,
      [id_user]
    );
    return deleted_exercises.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Finds all exercises associated with a routine
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} idRoutine - Routine's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found exercises.
 * @throws {CustomError} - If something goes wrong with the database
 */
async function find_exercise_by_id_user_idRoutine(id_user, idRoutine) {
  try {
    const found_exercises = await pool.query(
      `
      SELECT e.* FROM EXERCISE AS e
      JOIN COMPOSEDBY AS c ON e.id_user = c.id_user AND e.id_exercise = c.id_exercise
      WHERE e.id_user = $1 AND c.id_routine = $2
      ORDER BY c.exercise_order ASC
      `,
      [id_user, idRoutine]
    );
    return found_exercises.rows;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

module.exports = {
  create_new_exercise,//✓ //✓
  delete_exercise_by_id_user_id_exercise,//✓ //✓
  delete_exercises_by_id_user, //✓ //✓
  find_exercise_by_id_user_id_exercise,//✓ //✓
  find_exercise_by_id_user_idRoutine, //✓ //✓
  find_exercises_by_id_user,//✓ //✓
  find_exercises_by_id_user_idMuscleGroup,//✓ //✓
  find_exercises_by_id_user_intensity,//✓ //✓ 
  update_exercise,//✓ //✓ 
};
