const { pool } = require("../config/db_connection");
const CustomError = require("../utils/custom_error");

/**
 * Creates a new routine
 * @param {Object} routine - Object that contains information about the routine entity. It must contain:
 * routine.id_user {number} - User's id. Must be stored in database and be an integer
 * routine.routine_name  {string} - Name of the routine
 * routine.description {string} - Description of the routine
 * routine.time_before_start {string} - Time before start a routine 
 * ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * @returns {Promise<Object>} - A promise of the created routine
 * @throws {CustomError} - If something goes wrong with the database
 */
async function create_new_routine(routine) {
  try {
    const { id_user, routine_name, description, time_before_start } = routine;
    const new_routine = await pool.query(
      `
        INSERT INTO "ROUTINE" 
        (id_user, routine_name,
         description, time_before_start) VALUES 
        ($1, $2, $3, $4); 
        `,
      [id_user, routine_name, description, time_before_start]
    );
    return new_routine.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Finds routines by id_user. It can be ordered
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {string} sort_by - Routine's attribute to guide the order
 * @param {string} order - It's the way to order. It can be ASC or DESC
 * @returns {Promise<Object>} - A promise of the found routines
 * @throws {CustomError} - If something goes wrong with the database
 */
async function find_routines_by_id_user(id_user, sort_by, order) {
  try {
    let query = `
      SELECT r.* FROM "ROUTINE" AS r
      WHERE r.id_user = $1
    `;

    query += sort_by && order ? `ORDER BY ${sort_by} ${order}` : "";

    const found_routines = await pool.query(query, [id_user]);
    return found_routines.rows;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Finds a specific routine by id_user and id_routine
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_routine - Routine's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found routine
 * @throws {CustomError} - If something goes wrong with the database
 */
async function find_routine_by_id_user_id_routine(id_user, id_routine) {
  try {
    const found_routine = await pool.query(
      `
      SELECT r.* FROM "ROUTINE" AS r
      WHERE r.id_user = $1 AND r.id_routine = $2
      `,
      [id_user, id_routine]
    );
    return found_routine.rows;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Updates a specific routine
 * @param {Object} routine - Object that contains information about the routine entity. It must contain:
 * routine.id_user {number} - User's id. Must be stored in database and be an integer.
 * routine.id_routine {number} - Routine's id. Must be stored in database and be an integer.
 * routine.routine_name  {string} - Name of the routine
 * routine.description {string} - Description of the routine
 * routine.is_favorite {boolean} - If a routine is favorite or not
 * routine.time_before_start {string} - Time before start a routine 
 * routine.usage_routine {string} - How many time this routine was used
 * ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * @returns {Promise<Object>} - A promise of the updated routine
 * @throws {CustomError} - If something goes wrong with the database
 */
async function update_routine(routine) {
  try {
    const {
      id_user,
      id_routine,
      routine_name,
      description,
      is_favorite,
      time_before_start,
      usage_routine
    } = routine;

    const updated_routine = await pool.query(
      `
    UPDATE "ROUTINE"
    SET routine_name = $3,
    description = $4,
    is_favorite = $5,
    time_before_start = $6,
    usage_routine = $7
    WHERE id_user = $1 AND id_routine = $2
    `,
      [id_user, id_routine, routine_name, description, is_favorite, time_before_start, usage_routine]
    );
    return updated_routine.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Deletes all routines by id_user
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted routines
 * @throws {CustomError} - If something goes wrong with the database
 */
async function delete_routines_by_id_user(id_user) {
  try {
    const deleted_routines = await pool.query(
      `
    DELETE FROM "ROUTINE" AS r
    WHERE r.id_user = $1
    `,
      [id_user]
    );
    return deleted_routines.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Delete a specific routine by id_user and id_routine
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_routine - Routine's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted routine
 * @throws {CustomError} - If something goes wrong with the database
 */
async function delete_routine_by_id_user_id_routine(id_user, id_routine) {
  try {
    const deleted_routine = await pool.query(
      `
      DELETE FROM "ROUTINE" AS r
      WHERE r.id_user = $1 AND r.id_routine = $2
      `,
      [id_user, id_routine]
    );
    return deleted_routine.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Finds all routines associated with an exercise
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} idExercise - Exercise's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found routine
 * @throws {CustomError} - If something goes wrong with the database
 */
async function find_routines_of_exercise_by_id_user_idExercise(id_user, idExercise) {
  try {
    const found_routines = await pool.query(
      `
      SELECT r.* FROM "ROUTINE" AS r
      JOIN COMPOSEDBY AS c ON r.id_user = c.id_user AND r.id_routine = c.id_routine
      WHERE r.id_user = $1 AND c.id_exercise = $2
      `,
      [id_user, idExercise]
    );
    return found_routines.rows;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}



module.exports = {
  create_new_routine,//✓ //✓
  delete_routine_by_id_user_id_routine,//✓ //✓
  delete_routines_by_id_user,//✓ //✓ 
  find_routine_by_id_user_id_routine,//✓ //✓
  find_routines_by_id_user,//✓ //✓
  find_routines_of_exercise_by_id_user_idExercise, //✓ //✓
  update_routine//✓ //✓
};
