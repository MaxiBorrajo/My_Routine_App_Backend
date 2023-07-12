const { pool } = require("../config/db_connection");
const CustomError = require("../utils/custom_error");

/**
 * Finds all days
 * @returns {Promise<Object>} - A promise of the found days
 * @throws {CustomError} - If something goes wrong with the database
 */
async function get_all_days() {
    try {
      const found_days = await pool.query(
        `
      SELECT * FROM "DAY"
      `);
      return found_days.rows;
    } catch (error) {
      throw new CustomError(
        `Something went wrong with database. Error: ${error.message}`,
        500
      );
    }
  }

module.exports = {
  get_all_days//✓ //✓
};
