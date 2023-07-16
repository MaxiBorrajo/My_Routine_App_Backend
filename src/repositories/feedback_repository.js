//Imports

const { pool } = require("../config/db_connection");

const CustomError = require("../utils/custom_error");

const { are_equal } = require("../utils/utils_functions");

//Methods

/**
 * Creates a new feedback
 * @param {Object} feedback - Object that contains information about the feedback entity.
 * It must contain:
 * auth.id_user {number} - User's id. Must be stored in database and be an integer
 * auth.comment {string} - Comment with which to leave feedback
 * @returns {Promise<Object>} - A promise of the created feedback object
 * @throws {CustomError} - If something goes wrong with database
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

    if (are_equal(new_feedback.rowCount, 0)) {
      throw new CustomError("Feedback could not be sent", 500);
    }

    return new_feedback.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Deletes feedbacks by id_user
 * @param {number} id_user - User's id. Must be stored in database and be an integer
 * @returns {Promise<Object>} - A promise of the deleted feedbacks
 * @throws {CustomError} - If something goes wrong with database
 */
async function delete_feedback_by_id_user(id_user) {
  try {
    const deleted_feedback = await pool.query(
      `
      DELETE FROM FEEDBACK AS f
      WHERE f.id_user = $1
        `,
      [id_user]
    );

    return deleted_feedback.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

//Exports

module.exports = { create_new_feedback, delete_feedback_by_id_user };
