//Imports

const { pool } = require("../config/db_connection");

const CustomError = require("../utils/custom_error");

const { are_equal } = require("../utils/utils_functions");

//Methods

/**
 * Creates a new scheduled entity
 * @param {Object} scheduled - Object that contains information about the scheduled entity
 * It must contain:
 * scheduled.id_user {number} - User's id. Must be stored in database and be an integer
 * scheduled.id_routine {number} - Routine's id. Must be stored in database and be an integer
 * scheduled.id_day {number} - Day's id. Must be stored in database and be an integer
 * @returns {Promise<Object>} - A promise of the created scheduled object
 * @throws {CustomError} - If something goes wrong with database
 */
async function create_new_scheduled(scheduled) {
  try {
    const { id_user, id_day, id_routine } = scheduled;

    const new_scheduled = await pool.query(
      `
        INSERT INTO SCHEDULED
        (id_user, id_day, id_routine) 
        VALUES 
        ($1, $2, $3); 
        `,
      [id_user, id_day, id_routine]
    );

    if (are_equal(new_scheduled.rowCount, 0)) {
      throw new CustomError("The assignment could not be done", 500);
    }

    return new_scheduled.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Deletes a scheduled entity by id_user, id_routine and id_day
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_routine - Routine's id. It must be a integer and be store in database
 * @param {number} id_day- Day's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted scheduled entity
 * @throws {CustomError} - If something goes wrong with database
 */
async function delete_scheduled_by_id_user_id_routine_id_day(
  id_user,
  id_routine,
  id_day
) {
  try {
    const deleted_scheduled = await pool.query(
      `
    DELETE FROM SCHEDULED AS s
    WHERE s.id_user = $1 AND s.id_routine = $2
    AND s.id_day = $3
    `,
      [id_user, id_routine, id_day]
    );

    if (are_equal(deleted_scheduled.rowCount, 0)) {
      throw new CustomError("Assignment could not be deleted", 500);
    }

    return deleted_scheduled.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Deletes all scheduled entities by id_user and id_routine
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_routine - Routine's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted scheduled entities
 * @throws {CustomError} - If something goes wrong with database
 */
async function delete_scheduled_by_id_user_id_routine(id_user, id_routine) {
  try {
    const deleted_scheduled = await pool.query(
      `
    DELETE FROM SCHEDULED AS s
    WHERE s.id_user = $1 AND s.id_routine = $2
    `,
      [id_user, id_routine]
    );

    return deleted_scheduled.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Deletes a scheduled entities by id_user
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted scheduled entities
 * @throws {CustomError} - If something goes wrong with database
 */
async function delete_scheduled_by_id_user(id_user) {
  try {
    const deleted_scheduled = await pool.query(
      `
      DELETE FROM SCHEDULED AS s
      WHERE s.id_user = $1
      `,
      [id_user]
    );

    return deleted_scheduled.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds all days asigned to a routine
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_routine - Routine's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found scheduled entities
 * @throws {CustomError} - If something goes wrong with database
 */
async function find_scheduled_by_id_user_id_routine(id_user, id_routine) {
  try {
    const found_days = await pool.query(
      `
      SELECT d.* FROM SCHEDULED AS s
      JOIN "DAY" AS d ON d.id_day = s.id_day
      WHERE s.id_user = $1 AND s.id_routine = $2
      `,
      [id_user, id_routine]
    );

    return found_days.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds a specific scheduled entity
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_routine - Routine's id. It must be a integer and be store in database
 * @param {number} id_day - Day's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found scheduled entity
 * @throws {CustomError} - If something goes wrong with database
 */
async function find_scheduled_by_id_user_id_routine_id_day(
  id_user,
  id_routine,
  id_day
) {
  try {
    const found_days = await pool.query(
      `
      SELECT d.* FROM SCHEDULED AS s
      JOIN "DAY" AS d ON d.id_day = s.id_day
      WHERE s.id_user = $1 AND s.id_routine = $2
      AND s.id_day = $3
      `,
      [id_user, id_routine, id_day]
    );

    return found_days.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

//Exports

module.exports = {
  create_new_scheduled,
  delete_scheduled_by_id_user,
  delete_scheduled_by_id_user_id_routine_id_day,
  delete_scheduled_by_id_user_id_routine,
  find_scheduled_by_id_user_id_routine,
  find_scheduled_by_id_user_id_routine_id_day,
};
