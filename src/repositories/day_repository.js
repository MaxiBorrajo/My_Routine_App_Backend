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
      `
    );
    return found_days.rows;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Find a day by id_day
 * @param {number} id_day - Day's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found day
 * @throws {CustomError} - If something goes wrong with the database
 */
async function find_day_by_id_day(id_day) {
  try {
    const found_day = await pool.query(
      `
    SELECT d.* FROM "DAY" AS d
    WHERE d.id_day = $1
    `,
      [id_day]
    );
    return found_day.rows;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

module.exports = {
  get_all_days, //✓ //✓
  find_day_by_id_day,
};
