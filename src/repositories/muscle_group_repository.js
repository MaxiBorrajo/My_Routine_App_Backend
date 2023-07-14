const { pool } = require("../config/db_connection");
const CustomError = require("../utils/custom_error");

/**
 * Finds all muscle groups
 * @returns {Promise<Object>} - A promise of the found muscle groups
 * @throws {CustomError} - If something goes wrong with the database
 */
async function get_all_muscle_groups() {
  try {
    const found_muscle_groups = await pool.query(
      `
      SELECT * FROM MUSCLEGROUP
      `
    );
    return found_muscle_groups.rows;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Finds a specific muscle group
 * @param {number} id_muscle_group - Muscle group's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found muscle group
 * @throws {CustomError} - If something goes wrong with the database
 */
async function find_muscle_group_by_id_muscle_group(id_muscle_group) {
  try {
    const found_muscle_groups = await pool.query(
      `
    SELECT m.* FROM MUSCLEGROUP AS m
    WHERE m.id_muscle_group = $1
    `, [id_muscle_group]
    );
    return found_muscle_groups.rows;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

module.exports = {
  get_all_muscle_groups, //✓ //✓
  find_muscle_group_by_id_muscle_group
};
