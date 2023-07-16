//Imports

const { pool } = require("../config/db_connection");

const CustomError = require("../utils/custom_error");

const { are_equal } = require("../utils/utils_functions");

//Methods

/**
 * Creates a new user in database
 * @param {Object} user - Object that contains information about a user.
 * It must contain:
 * user.email {string} - User's email
 * user.name {string} - User's name
 * user.last_name {string} - User's last name
 * user.password {string} - User's password
 * @returns {Promise<Object>} - A promise of created user object
 * @throws {CustomError} - If something goes wrong with database
 */
async function create_new_user(user) {
  try {
    const { email, name, last_name, password } = user;

    const new_user = await pool.query(
      `
      INSERT INTO "USER" 
      (email, name, last_name, password) VALUES 
      ($1, $2, $3, $4); 
      `,
      [email, name, last_name, password]
    );

    if (!are_equal(new_user.rowCount, 1)) {
      throw new CustomError("User could not be created", 500);
    }

    return new_user.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds a user by its email in database
 * @param {string} email - User's email. Must be a valid email and be stored in database
 * @returns {Promise<Object>} - A promise of the found user object
 * @throws {CustomError} - If something goes wrong with the database
 */
async function find_user_by_email(email) {
  try {
    const found_user = await pool.query(
      `
      SELECT * FROM "USER" AS u
      WHERE u.email = $1
      `,
      [email]
    );

    return found_user.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Finds a user by id_user
 * @param {number} id_user - User's id. It must be a integer and be stored in database
 * @returns {Promise<Object>} - A promise of the found user object
 * @throws {CustomError} - If something goes wrong with database
 */
async function find_user_by_id_user(id_user) {
  try {
    const found_user = await pool.query(
      `
  SELECT * FROM "USER" AS u
  WHERE u.id_user = $1
  `,
      [id_user]
    );

    return found_user.rows;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Updates a user
 * @param {Object} user - Object that contains information about a user. It must contain:
 * user.id_user {string} - User's id
 * user.email {string} - User's email. Must be a valid email and
 * if it is different from the current one, it should not be repeated
 * user.name {string} - User's name
 * user.last_name {string} - User's last name
 * user.username {string} - User's username
 * user.public_id_profile_photo {string} - Public id given by Cloudinary
 * user.url_profile_photo {string} - Secure URL given by Cloudinary
 * user.password {string} - User's password
 * user.date_birth {Date} - User's birthday
 * user.theme {string} - User's chosen theme. Must be 'light', 'dark', or 'myroutine'
 * user.experience {string} - User's training experience. Must be 'beginnner', 'intermediate' or 'professional'
 * user.weight {string} - User's chosen weight unit. Must be KG or LBS
 * user.goal {string} - User's goal
 * user.rating {number} - User's rating about the app. Must be a value between 0 and 5
 * @returns {Promise<Object>} - A promise of the updated user object
 * @throws {CustomError} - If something goes wrong with the database
 */
async function update_user(user) {
  try {
    const {
      id_user,
      email,
      name,
      last_name,
      username,
      public_id_profile_photo,
      url_profile_photo,
      password,
      date_birth,
      theme,
      experience,
      weight,
      goal,
      rating,
    } = user;
    const updated_user = await pool.query(
      `
  UPDATE "USER"
  SET email = $2,
  name = $3,
  last_name = $4,
  username = $5,
  public_id_profile_photo = $6,
  url_profile_photo = $7,
  password = $8,
  date_birth = $9,
  theme = $10,
  experience = $11,
  weight = $12,
  goal = $13,
  rating = $14
  WHERE id_user = $1
  `,
      [
        id_user,
        email,
        name,
        last_name,
        username,
        public_id_profile_photo,
        url_profile_photo,
        password,
        date_birth,
        theme,
        experience,
        weight,
        goal,
        rating,
      ]
    );

    return updated_user.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

/**
 * Deletes an user by id_user
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted user
 * @throws {CustomError} - If something goes wrong with database
 */
async function delete_user_by_id_user(id_user) {
  try {
    const deleted_user = await pool.query(
      `
    DELETE FROM "USER" AS u
    WHERE u.id_user = $1
    `,
      [id_user]
    );

    if (are_equal(deleted_user.rowCount, 0)) {
      throw new CustomError(
        "User could not be deleted completely. Perhaps some associations were lost in the process",
        500
      );
    }

    return deleted_user.rowCount;
  } catch (error) {
    throw new CustomError(error.message, error.status);
  }
}

//Exports

module.exports = {
  create_new_user,
  find_user_by_email,
  find_user_by_id_user,
  update_user,
  delete_user_by_id_user,
};
