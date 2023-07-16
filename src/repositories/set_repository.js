//Imports

const { pool } = require("../config/db_connection");

const CustomError = require("../utils/custom_error");

const { are_equal } = require("../utils/utils_functions");

//Methods

/**
 * Creates a new set
 * @param {Object} set - Object that contains information about the set entity. It must contain:
 * set.id_user {number} - User's id. Must be stored in database and be an integer
 * set.id_set {number} - Set's id. Must be an integer
 * set.id_exercise {number} - Exercise's id. Must be stored in database and be an integer
 * set.weight {string} - How much weight is lifted in the set
 * set.rest_after_set {string} - Time after finish a set
 * ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * set.set_order {number} - Indicates what position the set occupies within the exercise.
 * Must be an integer
 * @returns {Promise<Object>} - A promise of the created set
 * @throws {CustomError} - If something goes wrong with database
 */
async function create_new_set(set) {
  try {
    const { id_user, id_set, id_exercise, weight, rest_after_set, set_order } =
      set;

    const new_set = await pool.query(
      `
        INSERT INTO "SET" 
        (id_user, id_exercise, id_set,
        weight, rest_after_set, set_order) VALUES 
        ($1, $2, $3, $4, $5, $6); 
        `,
      [id_user, id_exercise, id_set, weight, rest_after_set, set_order]
    );

    if (are_equal(new_set.rowCount, 0)) {
      throw new CustomError("Set could not be created", 500);
    }

    return new_set.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds sets by id_user and id_exercise
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise- Exercise's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found sets
 * @throws {CustomError} - If something goes wrong with database
 */
async function find_sets_by_id_user_id_exercise(id_user, id_exercise) {
  try {
    const found_sets = await pool.query(
      `
      SELECT s.id_set, s.weight, s.rest_after_set, s.set_order, t.time, r.repetition
      FROM "SET" AS s
      LEFT JOIN TIMESET AS t ON s.id_user = t.id_user 
      AND s.id_exercise = t.id_exercise 
      AND s.id_set = t.id_set
      LEFT JOIN REPETITIONSET AS r ON s.id_user = r.id_user 
      AND s.id_exercise = r.id_exercise 
      AND s.id_set = r.id_set
      WHERE s.id_user = $1 AND s.id_exercise = $2
      ORDER BY s.set_order ASC
      `,
      [id_user, id_exercise]
    );

    return found_sets.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds set by id_user, id_exercise and id_set
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise- Exercise's id. It must be a integer and be store in database
 * @param {number} id_set - Set's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found set
 * @throws {CustomError} - If something goes wrong with database
 */
async function find_set_by_id_user_id_exercise_id_set(
  id_user,
  id_exercise,
  id_set
) {
  try {
    const found_set = await pool.query(
      `
      SELECT s.*
      FROM "SET" AS s
      WHERE s.id_user = $1 AND s.id_exercise = $2 AND s.id_set = $3
        `,
      [id_user, id_exercise, id_set]
    );

    if (are_equal(found_set.rows.length, 0)) {
      throw new CustomError("Set not found", 404);
    }

    return found_set.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Updates a set
 * @param {Object} set - Object that contains a set's information. It must contain:
 * set.id_user {number} - User's id. Must be stored in database and be an integer
 * set.id_exercise {number} - Exercise's id. Must be stored in database and be an integer
 * set.id_set {number} - Set's id. Must be stored in database and be an integer
 * set.weight {string} - How much weight is lift in the set
 * set.rest_after_set {string} - Time after finish a set
 * ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * set.set_order {number} - Indicates what position the set occupies within the exercise.
 * Must be an integer
 * @returns {Promise<Object>} - A promise of the updated set
 * @throws {CustomError} - If something goes wrong with database
 */
async function update_set(set) {
  try {
    const { id_user, id_exercise, id_set, weight, rest_after_set, set_order } =
      set;

    const updated_set = await pool.query(
      `
          UPDATE "SET"
          SET weight = $4,
          rest_after_set = $5,
          set_order = $6
          WHERE id_user = $1 AND id_exercise = $2 AND id_set = $3
          `,
      [id_user, id_exercise, id_set, weight, rest_after_set, set_order]
    );

    if (are_equal(updated_set.rowCount, 0)) {
      throw new CustomError("Set could not be updated", 500);
    }

    return updated_set.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Delete a specific set by id_user, id_exercise and id_set
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @param {number} id_set - Set's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted set
 * @throws {CustomError} - If something goes wrong with database
 */
async function delete_set_by_id_user_id_exercise_id_set(
  id_user,
  id_exercise,
  id_set
) {
  try {
    const deleted_set = await pool.query(
      `
      DELETE FROM "SET" AS s
      WHERE s.id_user = $1 AND s.id_exercise = $2 AND s.id_set = $3
      `,
      [id_user, id_exercise, id_set]
    );

    return deleted_set.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Delete a sets of a exercise by id_user and id_exercise
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted sets
 * @throws {CustomError} - If something goes wrong with database
 */
async function delete_sets_by_id_user_id_exercise(id_user, id_exercise) {
  try {
    const deleted_sets = await pool.query(
      `
      DELETE FROM "SET" AS s
      WHERE s.id_user = $1 AND s.id_exercise = $2
      `,
      [id_user, id_exercise]
    );

    return deleted_sets.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Delete all sets of a user by id_user
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted sets
 * @throws {CustomError} - If something goes wrong with database
 */
async function delete_sets_by_id_user(id_user) {
  try {
    const deleted_sets = await pool.query(
      `
      DELETE FROM "SET" AS s
      WHERE s.id_user = $1
      `,
      [id_user]
    );

    return deleted_sets.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds the id_set of the last set created
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise- Exercise's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the id_set
 * @throws {CustomError} - If something goes wrong with database
 */
async function find_id_set_of_last_set_created_by_id_user_id_exercise(
  id_user,
  id_exercise
) {
  try {
    const found_id_set = await pool.query(
      `
      SELECT MAX(s.id_set)
      FROM "SET" AS s
      WHERE s.id_user = $1 AND s.id_exercise = $2
      `,
      [id_user, id_exercise]
    );

    return found_id_set.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

//Exports

module.exports = {
  create_new_set,
  delete_set_by_id_user_id_exercise_id_set,
  delete_sets_by_id_user,
  delete_sets_by_id_user_id_exercise,
  find_sets_by_id_user_id_exercise,
  update_set,
  find_id_set_of_last_set_created_by_id_user_id_exercise,
  find_set_by_id_user_id_exercise_id_set,
};
