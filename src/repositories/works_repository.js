//Imports

const { pool } = require("../config/db_connection");

const CustomError = require("../utils/custom_error");

const { are_equal } = require("../utils/utils_functions");

//Methods

/**
 * Creates a new works object
 * @param {Object} works - Object that contains information about works entity. It must contain:
 * works.id_user {number} - User's id. Must be stored in database and be an integer
 * works.id_exercise {number} - Exercise's id. Must be stored in database and be an integer
 * works.id_muscle_group {number} - Muscle group's id. Must be stored in database and be an integer
 * @returns {Promise<Object>} - A promise of the created works object
 * @throws {CustomError} - If something goes wrong with database
 */
async function create_new_works(works) {
  try {
    const { id_user, id_exercise, id_muscle_group } = works;

    const new_works = await pool.query(
      `
        INSERT INTO WORKS 
        (id_user, id_exercise,
        id_muscle_group) VALUES 
        ($1, $2, $3); 
        `,
      [id_user, id_exercise, id_muscle_group]
    );

    if (are_equal(new_works.rowCount, 0)) {
      throw new CustomError("Association could not be created", 500);
    }

    return new_works.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds muscle groups assigned to an exercise
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found muscle groups
 * @throws {CustomError} - If something goes wrong with database
 */
async function find_muscle_groups_by_id_user_id_exercise(id_user, id_exercise) {
  try {
    const found_muscle_groups = await pool.query(
      `
    SELECT m.* FROM MUSCLEGROUP AS m
    JOIN WORKS AS w ON m.id_muscle_group = w.id_muscle_group
    WHERE w.id_user = $1 AND w.id_exercise = $2
    `,
      [id_user, id_exercise]
    );

    return found_muscle_groups.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds a specific muscle group assigned to an exercise
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @param {number} id_muscle_group - Muscle group's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found muscle group
 * @throws {CustomError} - If something goes wrong with the database
 */
async function find_muscle_group_by_id_user_id_exercise_id_muscle_group(
  id_user,
  id_exercise,
  id_muscle_group
) {
  try {
    const found_muscle_group = await pool.query(
      `
    SELECT m.* FROM MUSCLEGROUP AS m
    JOIN WORKS AS w ON m.id_muscle_group = w.id_muscle_group
    WHERE w.id_user = $1 AND w.id_exercise = $2 AND w.id_muscle_group = $3
    `,
      [id_user, id_exercise, id_muscle_group]
    );

    return found_muscle_group.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Deletes all works of a user by id_user
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted works
 * @throws {CustomError} - If something goes wrong with database
 */
async function delete_works_by_id_user(id_user) {
  try {
    const deleted_works = await pool.query(
      `
    DELETE FROM WORKS AS w
    WHERE w.id_user = $1
    `,
      [id_user]
    );

    return deleted_works.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Deletes all works of a exercise by id_user and id_exercise
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted works
 * @throws {CustomError} - If something goes wrong with database
 */
async function delete_works_by_id_user_id_exercise(id_user, id_exercise) {
  try {
    const deleted_works = await pool.query(
      `
    DELETE FROM WORKS AS w
    WHERE w.id_user = $1 AND w.id_exercise = $2
    `,
      [id_user, id_exercise]
    );

    return deleted_works.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Delete a specific works of an exercise by id_user, id_exercise and id_muscle_group
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @param {number} id_muscle_group - Muscle group's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted works
 * @throws {CustomError} - If something goes wrong with database
 */
async function delete_works_by_id_user_id_exercise_id_muscle_group(
  id_user,
  id_exercise,
  id_muscle_group
) {
  try {
    const deleted_works = await pool.query(
      `
      DELETE FROM WORKS AS w
      WHERE w.id_user = $1 AND w.id_exercise = $2 AND w.id_muscle_group = $3
      `,
      [id_user, id_exercise, id_muscle_group]
    );

    if (are_equal(deleted_works.rowCount, 0)) {
      throw new CustomError(
        "Muscle group could not unassigned to the given exercise",
        500
      );
    }

    return deleted_works.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

module.exports = {
  create_new_works,
  delete_works_by_id_user,
  delete_works_by_id_user_id_exercise,
  delete_works_by_id_user_id_exercise_id_muscle_group,
  find_muscle_groups_by_id_user_id_exercise,
  find_muscle_group_by_id_user_id_exercise_id_muscle_group,
};
