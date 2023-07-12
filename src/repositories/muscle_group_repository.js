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
      `);
      return found_muscle_groups.rows;
    } catch (error) {
      throw new CustomError(
        `Something went wrong with database. Error: ${error.message}`,
        500
      );
    }
  }

module.exports = {
  get_all_muscle_groups//✓ //✓
};
