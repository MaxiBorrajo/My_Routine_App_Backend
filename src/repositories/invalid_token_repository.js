//Imports

const { pool } = require("../config/db_connection");

const CustomError = require("../utils/custom_error");

//Methods

/**
 * Creates a new invalid token
 * @param {Object} invalid_token - Object that contains information about the invalid token entity.
 * It must contain:
 * invalid_token.id_user {number} - User's id. Must be stored in database and be an integer
 * invalid_token.token {string} - The token to invalidate
 * @returns {Promise<Object>} - A promise of the created invalid token object
 * @throws {CustomError} - If something goes wrong with database
 */
async function create_new_invalid_token(invalid_token) {
  try {
    const { id_user, token } = invalid_token;

    const new_invalid_token = await pool.query(
      `
        INSERT INTO INVALIDTOKEN
        (id_user, "token") 
        VALUES 
        ($1, $2); 
        `,
      [id_user, token]
    );

    return new_invalid_token.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds an invalid token by token
 * @param {string} token - An invalid token to search
 * @returns {Promise<Object>} - A promise of the found invalid tokens
 * @throws {CustomError} - If something goes wrong with database
 */
async function find_invalid_tokens_by_token(token) {
  try {
    const found_invalid_token = await pool.query(
      `
      SELECT * FROM INVALIDTOKEN AS i
      WHERE i."token" = $1
      `,
      [token]
    );

    return found_invalid_token.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Deletes invalid tokens by id_user
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted invalid tokens
 * @throws {CustomError} - If something goes wrong with the database
 */
async function delete_invalid_tokens_by_id_user(id_user) {
  try {
    const deleted_invalid_tokens = await pool.query(
      `
    DELETE FROM INVALIDTOKEN AS i
    WHERE i.id_user = $1
    `,
      [id_user]
    );

    return deleted_invalid_tokens.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

//Exports

module.exports = {
  create_new_invalid_token,
  delete_invalid_tokens_by_id_user,
  find_invalid_tokens_by_token,
};
