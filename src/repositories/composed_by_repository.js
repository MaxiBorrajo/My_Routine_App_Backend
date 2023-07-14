const { pool } = require("../config/db_connection");
const CustomError = require("../utils/custom_error");

/**
 * Creates a new composed_by entity
 * @param {Object} composed_by - Object that contains information about the composed_by entity.
 * It must contain:
 * composed_by.id_user {number} - User's id. Must be stored in database and be an integer
 * composed_by.id_exercise {number} - Exercise's id. Must be stored in database and be an integer
 * composed_by.id_routine {number} - Routine's id. Must be stored in database and be an integer
 * composed_by.exercise_order {number} - Order of the exercise within the routine
 * @returns {Promise<Object>} - A promise of the created composed_by object
 * @throws {CustomError} - If something goes wrong with the database
 */
async function create_new_composed_by(composed_by) {
  try {
    const { id_user, id_exercise, id_routine, exercise_order } =
    composed_by;
      
    const new_composed_by = await pool.query(
      `
        INSERT INTO COMPOSEDBY
        (id_user, id_exercise, id_routine, exercise_order) 
        VALUES 
        ($1, $2, $3, $4); 
        `,
      [id_user, id_exercise, id_routine, exercise_order]
    );
    return new_composed_by.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Finds a specific composed_by entity by id_user, id_routine and id_exercise
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_routine - Routine's id. It must be a integer and be store in database
 * @param {number} id_exercise- Exercise's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found composed_by entity
 * @throws {CustomError} - If something goes wrong with the database
 */
async function find_composed_by_by_id_user_id_routine_id_exercise(id_user, id_routine, id_exercise){
  try {
    const found_composed_by = await pool.query(
      `
        SELECT DISTINCT c.id_exercise, c.id_routine, c.exercise_order 
        FROM COMPOSEDBY AS c
        WHERE c.id_user = $1 AND c.id_exercise = $2 AND c.id_routine = $3 ; 
        `,
      [id_user, id_exercise, id_routine]
    );

    return found_composed_by.rows
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
} 

/**
 * Updates composed_by
 * @param {Object} composed_by - Object that contains composed_by entity information of a user. 
 * It must contain:
 * composed_by.id_user {number} - User's id. Must be stored in database and be an integer
 * composed_by.id_exercise {number} - Exercise's id. Must be stored in database and be an integer
 * composed_by.id_routine {number} - Routine's id. Must be stored in database and be an integer
 * composed_by.exercise_order {number} - Order of the exercise within the routine
 * @returns {Promise<Object>} - A promise of the composed_by entity
 * @throws {CustomError} - If something goes wrong with the database
 */
async function update_composed_by(composed_by) {
  try {
    const { id_user, id_exercise, id_routine, exercise_order } =
    composed_by;

    const updated_composed_by = await pool.query(
      `
    UPDATE COMPOSEDBY
    SET exercise_order = $4
    WHERE id_user = $1 AND id_exercise = $2
    AND id_routine = $3
    `,
      [id_user, id_exercise, id_routine, exercise_order]
    );

    return updated_composed_by.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Deletes a composed_by entity by id_user, id_routine and id_exercise
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_routine - Routine's id. It must be a integer and be store in database
 * @param {number} id_exercise- Exercise's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted composed_by entity
 * @throws {CustomError} - If something goes wrong with the database
 */
async function delete_composed_by_by_id_user_id_routine_id_exercise(id_user, id_routine, id_exercise) {
  try {
    const deleted_composed_by = await pool.query(
      `
    DELETE FROM COMPOSEDBY AS c
    WHERE c.id_user = $1 AND c.id_routine = $2
    AND c.id_exercise = $3
    `,
      [id_user, id_routine, id_exercise]
    );
    return deleted_composed_by.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Deletes all composed_by entity by id_user and id_exercise
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise- Exercise's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted composed_by entity
 * @throws {CustomError} - If something goes wrong with the database
 */
async function delete_composed_by_by_id_user_id_exercise(id_user, id_exercise) {
  try {
    const deleted_composed_by = await pool.query(
      `
    DELETE FROM COMPOSEDBY AS c
    WHERE c.id_user = $1 AND c.id_exercise = $2
    `,
      [id_user, id_exercise]
    );
    return deleted_composed_by.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Deletes all composed_by entity by id_user, id_routine
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_routine - Routine's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted composed_by entity
 * @throws {CustomError} - If something goes wrong with the database
 */
async function delete_composed_by_by_id_user_id_routine(id_user, id_routine) {
  try {
    const deleted_composed_by = await pool.query(
      `
    DELETE FROM COMPOSEDBY AS c
    WHERE c.id_user = $1 AND c.id_routine = $2
    `,
      [id_user, id_routine]
    );
    return deleted_composed_by.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Deletes all composed_by entities by id_user
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted composed_by entities
 * @throws {CustomError} - If something goes wrong with the database
 */
async function delete_composed_by_by_id_user(id_user) {
    try {
      const deleted_composed_by = await pool.query(
        `
      DELETE FROM COMPOSEDBY AS c
      WHERE c.id_user = $1
      `,
        [id_user]
      );
      return deleted_composed_by.rowCount;
    } catch (error) {
      throw new CustomError(
        `Something went wrong with database. Error: ${error.message}`,
        500
      );
    }
  }

module.exports = {
  create_new_composed_by, //✓ //✓
  find_composed_by_by_id_user_id_routine_id_exercise,
  delete_composed_by_by_id_user, //✓ //✓
  delete_composed_by_by_id_user_id_routine_id_exercise, //✓ //✓
  update_composed_by, //✓ //✓
  delete_composed_by_by_id_user_id_routine, //✓ //✓
  delete_composed_by_by_id_user_id_exercise //✓ //✓
};
