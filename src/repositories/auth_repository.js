const { pool } = require("../config/db_connection");
const CustomError = require("../utils/custom_error");

/**
 * Creates a new auth entity
 * @param {Object} auth - Object that contains information about the auth entity. It must contain:
 * auth.id_user {number} - User's id. Must be stored in database and be an integer
 * auth.verification_code {string} - A code used in changing a user's password
 * auth.verification_expiration {date} - A expiration for the verification code
 * auth.refresh_token {string} - User's refresh token used in authentication
 * @returns {Promise<Object>} - A promise of the created auth object
 * @throws {CustomError} - If something goes wrong with the database
 */
async function create_new_auth(auth) {
  try {
    const { id_user, reset_password_token, reset_password_token_expiration, refresh_token } =
      auth;
      
    const new_auth = await pool.query(
      `
        INSERT INTO AUTH
        (id_user, reset_password_token, reset_password_token_expiration, refresh_token) 
        VALUES 
        ($1, $2, $3, $4); 
        `,
      [id_user, reset_password_token, reset_password_token_expiration, refresh_token]
    );
    return new_auth.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Finds an auth entity by an id_user
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found auth entity
 * @throws {CustomError} - If something goes wrong with the database
 */
async function find_auth_by_id_user(id_user) {
  try {
    const found_auth = await pool.query(
      `
    SELECT * FROM AUTH AS a
    WHERE a.id_user = $1
    `,
      [id_user]
    );
    return found_auth.rows;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Updates auth entity
 * @param {Object} auth - Object that contains the new auth entity information. It must contain:
 * auth.id_user {number} - User's id. Must be stored in database and be an integer
 * auth.reset_password_token {string} - A token used in changing a user's password
 * auth.reset_password_token_expiration {date} - A expiration for the reset password token
 * auth.refresh_token {string} - User's refresh token used in authentication
 * @returns {Promise<Object>} - A promise of the updated auth object.
 * @throws {CustomError} - If something goes wrong with the database
 */
async function update_auth(auth) {
  try {
    const { id_user, reset_password_token, reset_password_token_expiration, refresh_token } =
      auth;

    const updated_auth = await pool.query(
      `
    UPDATE AUTH
    SET reset_password_token = $2,
    reset_password_token_expiration = $3,
    refresh_token = $4
    WHERE id_user = $1
    `,
      [id_user, reset_password_token, reset_password_token_expiration, refresh_token]
    );

    return updated_auth.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Deletes an auth entity by id_user
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted auth entity
 * @throws {CustomError} - If something goes wrong with the database
 */
async function delete_auth_by_id_user(id_user) {
  try {
    const deleted_auth = await pool.query(
      `
    DELETE FROM AUTH AS a
    WHERE a.id_user = $1
    `,
      [id_user]
    );
    return deleted_auth.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

module.exports = {
  create_new_auth,//✓ //✓
  delete_auth_by_id_user,//✓ //✓
  find_auth_by_id_user,//✓ //✓
  update_auth,//✓ //✓
};
