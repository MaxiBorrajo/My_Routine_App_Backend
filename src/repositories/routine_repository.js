//Imports

const { pool } = require("../config/db_connection");

const CustomError = require("../utils/custom_error");

const { are_equal } = require("../utils/utils_functions");

//Methods

/**
 * Creates a new routine
 * @param {Object} routine - Object that contains information about the routine entity. It must contain:
 * routine.id_user {number} - User's id. Must be stored in database and be an integer
 * routine.routine_name  {string} - Name of the routine
 * routine.description {string} - Description of the routine
 * routine.time_before_start {string} - Time before start a routine
 * ('5 seconds', '10 minutes', '10 minutes 5 seconds')
 * @returns {Promise<Object>} - A promise of the created routine
 * @throws {CustomError} - If something goes wrong with database
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

    if (are_equal(new_routine.rowCount, 0)) {
      throw new CustomError("Routine could not be created", 500);
    }

    return new_routine.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds routines by id_user. It can be ordered
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {string} sort_by - (Optional) Routine's attribute to guide the order
 * @param {string} order - (Optional) It's the way to order. It can be ASC or DESC
 * @returns {Promise<Object>} - A promise of the found routines
 * @throws {CustomError} - If something goes wrong with database
 */
async function find_routines_by_id_user(id_user, sort_by, order) {
  try {
    let query = `
      SELECT DISTINCT r.id_routine, r.routine_name,
      r.created_at, r.usage_routine, r.time_before_start,
      r.description, r.is_favorite FROM "ROUTINE" AS r
      WHERE r.id_user = $1
    `;

    query += sort_by && order ? `ORDER BY ${sort_by} ${order}` : "";

    const found_routines = await pool.query(query, [id_user]);

    return found_routines.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds a specific routine by id_user and id_routine
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_routine - Routine's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found routine
 * @throws {CustomError} - If something goes wrong with database
 */
async function find_routine_by_id_user_id_routine(id_user, id_routine) {
  try {
    const found_routine = await pool.query(
      `
      SELECT DISTINCT r.id_routine, r.routine_name,
      r.created_at, r.usage_routine, r.time_before_start,
      r.description, r.is_favorite FROM "ROUTINE" AS r
      WHERE r.id_user = $1 AND r.id_routine = $2
      `,
      [id_user, id_routine]
    );

    if (are_equal(found_routine.rows.length, 0)) {
      throw new CustomError("Routine not found", 404);
    }

    return found_routine.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
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
 * @throws {CustomError} - If something goes wrong with database
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
      usage_routine,
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
      [
        id_user,
        id_routine,
        routine_name,
        description,
        is_favorite,
        time_before_start,
        usage_routine,
      ]
    );

    if (are_equal(updated_routine.rowCount, 0)) {
      throw new CustomError("Routine could not be updated", 500);
    }

    return updated_routine.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Deletes all routines by id_user
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted routines
 * @throws {CustomError} - If something goes wrong with database
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
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Delete a specific routine by id_user and id_routine
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_routine - Routine's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted routine
 * @throws {CustomError} - If something goes wrong with database
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

    if (are_equal(deleted_routine.rowCount, 0)) {
      throw new CustomError(
        "Routine could not be deleted completely. Perhaps some associations were lost in the process",
        500
      );
    }

    return deleted_routine.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds all routines associated with an exercise
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found routine
 * @throws {CustomError} - If something goes wrong with database
 */
async function find_routines_of_exercise_by_id_user_idExercise(
  id_user,
  id_exercise
) {
  try {
    const found_routines = await pool.query(
      `
      SELECT DISTINCT r.id_routine, r.routine_name,
      r.created_at, r.usage_routine, r.time_before_start,
      r.description, r.is_favorite FROM "ROUTINE" AS r
      JOIN COMPOSEDBY AS c ON r.id_user = c.id_user AND r.id_routine = c.id_routine
      WHERE r.id_user = $1 AND c.id_exercise = $2
      `,
      [id_user, id_exercise]
    );

    return found_routines.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds routines by id_user and if is favorite or not.
 * It can be ordered
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {boolean} is_favorite - true if the exercise if a favorite one, false otherwise
 * @param {string} sort_by - Attribute of an exercise by which to order the results
 * @param {string} order - ASC (ascending) or DESC (descending)
 * @returns {Promise<Object>} - A promise of the found routines
 * @throws {CustomError} - If something goes wrong with database
 */
async function find_routines_by_id_user_isFavorite(
  id_user,
  is_favorite,
  sort_by,
  order
) {
  try {
    let query = `
    SELECT DISTINCT r.id_routine, r.routine_name,
    r.created_at, r.usage_routine, r.time_before_start,
    r.description, r.is_favorite FROM "ROUTINE" AS r
    WHERE r.id_user = $1 AND 
  `;

    let params = [id_user];

    query += is_favorite ? "is_favorite\n" : "NOT is_favorite\n";

    query += sort_by && order ? `ORDER BY ${sort_by} ${order}` : "";

    const found_routines = await pool.query(query, params);

    return found_routines.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds routines by id_user and id_day.
 * It can be ordered
 * @param {number} id_user - User's id. It must be an integer and be store in database
 * @param {number[]} days - Array of day's id. They must be an integer
 * and be store in database
 * @param {string} sort_by - Attribute of an exercise by which to order the results
 * @param {string} order - ASC (ascending) or DESC (descending)
 * @returns {Promise<Object>} - A promise of the found exercises
 * @throws {CustomError} - If something goes wrong with database
 */
async function find_routines_by_id_user_id_day(id_user, days, sort_by, order) {
  try {
    let query = `
    SELECT DISTINCT r.id_routine, r.routine_name,
    r.created_at, r.usage_routine, r.time_before_start,
    r.description, r.is_favorite FROM "ROUTINE" AS r
    JOIN SCHEDULED AS s ON r.id_user = s.id_user 
    AND r.id_routine = s.id_routine
    WHERE r.id_user = $1 AND (
  `;

    let params = [id_user];

    days.forEach((id_day, index) => {
      if (index === days.length - 1) {
        query += `s.id_day = $${index + 2})\n`;
      } else {
        query += `s.id_day = $${index + 2} AND\n`;
      }
      params.push(id_day);
    });

    query += sort_by && order ? `ORDER BY ${sort_by} ${order}` : "";

    const found_routines = await pool.query(query, params);

    return found_routines.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds the id_routine of the last routine created
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the id_routine
 * @throws {CustomError} - If something goes wrong with database
 */
async function find_id_routine_of_last_routine_created_by_id_user(
  id_user
) {
  try {
    const found_id_routine = await pool.query(
      `
      SELECT MAX(r.id_routine)
      FROM "ROUTINE" AS r
      WHERE r.id_user = $1
      `,
      [id_user]
    );

    return found_id_routine.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}


//Exports

module.exports = {
  create_new_routine,
  delete_routine_by_id_user_id_routine,
  delete_routines_by_id_user,
  find_routine_by_id_user_id_routine,
  find_routines_by_id_user,
  find_routines_by_id_user_isFavorite,
  find_routines_by_id_user_id_day,
  find_routines_of_exercise_by_id_user_idExercise,
  update_routine,
  find_id_routine_of_last_routine_created_by_id_user
};
