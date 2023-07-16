//Imports

const { pool } = require("../config/db_connection");

const CustomError = require("../utils/custom_error");

//Methods

/**
 * Creates a new time set object
 * @param {Object} time_set - Object that contains information about the time set entity
 * It must contain:
 * time_set.id_user {number} - User's id. Must be stored in database and be an integer
 * time_set.id_exercise {number} - Exercise's id. Must be stored in database and be an integer
 * time_set.id_set {number} - Set's id. Must be stored in database and be an integer
 * time_set.time {string} - How much time to do in the set
 * ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * @returns {Promise<Object>} - A promise of the created time set object
 * @throws {CustomError} - If something goes wrong with database
 */
async function create_new_time_set(time_set) {
  try {
    const { id_user, id_exercise, id_set, time } = time_set;

    const new_time_set = await pool.query(
      `
        INSERT INTO TIMESET
        (id_user, id_exercise, id_set, time) 
        VALUES 
        ($1, $2, $3, $4); 
        `,
      [id_user, id_exercise, id_set, time]
    );

    return new_time_set.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Updates time set object
 * @param {Object} time_set - Object that contains information about the time set entity
 * It must contain:
 * time_set.id_user {number} - User's id. Must be stored in database and be an integer
 * time_set.id_exercise {number} - Exercise's id. Must be stored in database and be an integer
 * time_set.id_set {number} - Set's id. Must be stored in database and be an integer
 * time_set.time {string} - How much time to do in the set
 * ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * @returns {Promise<Object>} - A promise of to the updated time set object
 * @throws {CustomError} - If something goes wrong with database
 */
async function update_time_set(time_set) {
  try {
    const { id_user, id_exercise, id_set, time } = time_set;

    const updated_time_set = await pool.query(
      `
    UPDATE TIMESET
    SET time = $4
    WHERE id_user = $1 AND id_exercise = $2 AND id_set = $3
    `,
      [id_user, id_exercise, id_set, time]
    );

    return updated_time_set.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Deletes time sets of a user by id_user
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted time set objects
 * @throws {CustomError} - If something goes wrong with the database
 */
async function delete_time_set_by_id_user(id_user) {
  try {
    const deleted_time_sets = await pool.query(
      `
    DELETE FROM TIMESET AS r
    WHERE r.id_user = $1
    `,
      [id_user]
    );

    return deleted_time_sets.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Deletes time sets object of a exercise by id_user and id_exercise
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted time set objects
 * @throws {CustomError} - If something goes wrong with database
 */
async function delete_time_set_by_id_user_id_exercise(id_user, id_exercise) {
  try {
    const deleted_time_sets = await pool.query(
      `
    DELETE FROM TIMESET AS r
    WHERE r.id_user = $1 AND r.id_exercise = $2
    `,
      [id_user, id_exercise]
    );

    return deleted_time_sets.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Deletes a specific time set object by id_user, id_exercise and id_set
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @param {number} id_set - Set's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted time set object
 * @throws {CustomError} - If something goes wrong with database
 */
async function delete_time_set_by_id_user_id_exercise_id_set(
  id_user,
  id_exercise,
  id_set
) {
  try {
    const deleted_time_set = await pool.query(
      `
    DELETE FROM TIMESET AS r
    WHERE r.id_user = $1 AND r.id_exercise = $2 AND r.id_set = $3
    `,
      [id_user, id_exercise, id_set]
    );

    return deleted_time_set.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds a specific time set object by id_user, id_exercise and id_set
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @param {number} id_set - Set's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found time set object
 * @throws {CustomError} - If something goes wrong with database
 */
async function find_time_set_by_id_user_id_exercise_id_set(
  id_user,
  id_exercise,
  id_set
) {
  try {
    const found_time_set = await pool.query(
      `
    SELECT r.* FROM TIMESET AS r
    WHERE r.id_user = $1 AND r.id_exercise = $2 AND r.id_set = $3
    `,
      [id_user, id_exercise, id_set]
    );

    return found_time_set.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

//Exports

module.exports = {
  create_new_time_set,
  delete_time_set_by_id_user,
  delete_time_set_by_id_user_id_exercise,
  delete_time_set_by_id_user_id_exercise_id_set,
  update_time_set,
  find_time_set_by_id_user_id_exercise_id_set,
};
