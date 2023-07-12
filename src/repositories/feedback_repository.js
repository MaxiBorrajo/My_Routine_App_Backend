const { pool } = require("../config/db_connection");
const CustomError = require("../utils/custom_error");

/**
 * Creates a new feedback
 * @param {Object} feedback - Object that contains information about the feedback entity.
 * It must contain:
 * auth.id_user {number} - User's id. Must be stored in database and be an integer
 * auth.comment {string} - Comment with which to leave feedback
 * @returns {Promise<Object>} - A promise of the created feedback object
 * @throws {CustomError} - If something goes wrong with the database
 */
async function create_new_feedback(feedback) {
  try {
    const { id_user, comment } = feedback;

    const new_feedback = await pool.query(
      `
        INSERT INTO FEEDBACK
        (id_user, "comment") 
        VALUES 
        ($1, $2); 
        `,
      [id_user, comment]
    );
    return new_feedback.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

module.exports = { create_new_feedback };
