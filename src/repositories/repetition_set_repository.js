//Imports

const { pool } = require("../config/db_connection");

const CustomError = require("../utils/custom_error");

//Methods

/**
 * Creates a new repetition set object
 * @param {Object} repetition_set - Object that contains information about the repetition entity.
 * It must contain:
 * repetition_set.id_user {number} - User's id. Must be stored in database and be an integer
 * repetition_set.id_exercise {number} - Exercise's id. Must be stored in database and be an integer
 * repetition_set.id_set {number} - Set's id. Must be stored in database and be an integer
 * repetition_set.repetition {number} - How much repetitions are done in the set
 * @returns {Promise<Object>} - A promise created of the repetition set object
 * @throws {CustomError} - If something goes wrong with database
 */
async function create_new_repetition_set(repetition_set) {
  try {
    const { id_user, id_exercise, id_set, repetition } = repetition_set;

    const new_repetition_set = await pool.query(
      `
        INSERT INTO REPETITIONSET
        (id_user, id_exercise, id_set, repetition) 
        VALUES 
        ($1, $2, $3, $4); 
        `,
      [id_user, id_exercise, id_set, repetition]
    );

    return new_repetition_set.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Updates repetition set object.
 * @param {Object} repetition_set - Object that contains information about the repetition set entity.
 * It must contain:
 * repetition_set.id_user {number} - User's id. Must be stored in database and be an integer
 * repetition_set.id_exercise {number} - Exercise's id. Must be stored in database and be an integer
 * repetition_set.id_set {number} - Set's id. Must be stored in database and be an integer
 * repetition_set.repetition {number} - How much repetitions to do in the set
 * @returns {Promise<Object>} - A promise of to the updated repetition set object.
 * @throws {CustomError} - If something goes wrong with database
 */
async function update_repetition_set(repetition_set) {
  try {
    const { id_user, id_exercise, id_set, repetition } = repetition_set;

    const updated_repetition_set = await pool.query(
      `
    UPDATE REPETITIONSET
    SET repetition = $4
    WHERE id_user = $1 AND id_exercise = $2 AND id_set = $3
    `,
      [id_user, id_exercise, id_set, repetition]
    );

    return updated_repetition_set.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Deletes repetition sets by id_user
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted repetition sets
 * @throws {CustomError} - If something goes wrong with database
 */
async function delete_repetition_sets_by_id_user(id_user) {
  try {
    const deleted_repetition_sets = await pool.query(
      `
    DELETE FROM REPETITIONSET AS r
    WHERE r.id_user = $1
    `,
      [id_user]
    );

    return deleted_repetition_sets.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Deletes repetition sets by id_user and id_exercise
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted repetition sets
 * @throws {CustomError} - If something goes wrong with database
 */
async function delete_repetition_sets_by_id_user_id_exercise(
  id_user,
  id_exercise
) {
  try {
    const deleted_repetition_sets = await pool.query(
      `
    DELETE FROM REPETITIONSET AS r
    WHERE r.id_user = $1 AND r.id_exercise = $2
    `,
      [id_user, id_exercise]
    );

    return deleted_repetition_sets.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Deletes a specific repetition set by id_user, id_exercise and id_set
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @param {number} id_set - Set's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted repetition set
 * @throws {CustomError} - If something goes wrong with database
 */
async function delete_repetition_set_by_id_user_id_exercise_id_set(
  id_user,
  id_exercise,
  id_set
) {
  try {
    const deleted_repetition_set = await pool.query(
      `
    DELETE FROM REPETITIONSET AS r
    WHERE r.id_user = $1 AND r.id_exercise = $2 AND r.id_set = $3
    `,
      [id_user, id_exercise, id_set]
    );

    return deleted_repetition_set.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds a specific repetition set by id_user, id_exercise and id_set
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @param {number} id_set - Set's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found repetition set
 * @throws {CustomError} - If something goes wrong with database
 */
async function find_repetition_set_by_id_user_id_exercise_id_set(
  id_user,
  id_exercise,
  id_set
) {
  try {
    const found_repetition_set = await pool.query(
      `
    SELECT r.* FROM REPETITIONSET AS r
    WHERE r.id_user = $1 AND r.id_exercise = $2 AND r.id_set = $3
    `,
      [id_user, id_exercise, id_set]
    );

    return found_repetition_set.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

//Methods

module.exports = {
  create_new_repetition_set,
  delete_repetition_sets_by_id_user,
  delete_repetition_sets_by_id_user_id_exercise,
  delete_repetition_set_by_id_user_id_exercise_id_set,
  update_repetition_set,
  find_repetition_set_by_id_user_id_exercise_id_set,
};
