const { pool } = require("../config/db_connection");
const CustomError = require("../utils/custom_error");

/**
 * Creates a new photo
 * @param {Object} photo - Object that contains information about the photo entity. It must contain:
 * photo.id_user {number} - User's id. Must be stored in database and be an integer.
 * photo.id_exercise {number} - Exercise's id. Must be stored in database and be an integer.
 * photo.public_id {string} - Public id given by Cloudinary
 * photo.url_photo {string} - Secure url given by Cloudinary
 * @returns {Promise<Object>} - A promise of the created photo
 * @throws {CustomError} - If something goes wrong with the database
 */
async function create_new_photo(photo) {
  try {
    const { id_user, id_exercise, public_id, url_photo } = photo;
    //subida a cloudinary
    const new_photo = await pool.query(
      `
        INSERT INTO PHOTOEXERCISE 
        (id_user, id_exercise,
          public_id, url_photo) VALUES 
        ($1, $2, $3, $4); 
        `,
      [
        id_user,
        id_exercise,
        public_id,
        url_photo,
      ]
    );
    return new_photo.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Finds photos of an exercise by id_user and id_exercise
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the found photos
 * @throws {CustomError} - If something goes wrong with the database
 */
async function find_photos_by_id_user_id_exercise(id_user, id_exercise) {
  try {
    const found_photos = await pool.query(
      `
    SELECT p.public_id, p.url_photo FROM PHOTOEXERCISE AS p
    WHERE p.id_user = $1 AND p.id_exercise = $2
    `,
      [id_user, id_exercise]
    );
    return found_photos.rows;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Finds a specific photo of an exercise by id_user, id_exercise and public_id
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @param {string} public_id - Photo's id. It must be a string and be store in database
 * @returns {Promise<Object>} - A promise of the found photo
 * @throws {CustomError} - If something goes wrong with the database
 */
async function find_photo_by_id_user_id_exercise_public_id(id_user, id_exercise, public_id) {
  try {
    const found_photos = await pool.query(
      `
    SELECT p.id_exercise, p.public_id, p.url_photo FROM PHOTOEXERCISE AS p
    WHERE p.id_user = $1 AND p.id_exercise = $2 AND p.public_id = $3
    `,
      [id_user, id_exercise, public_id]
    );
    return found_photos.rows;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Deletes all photos of a user by id_user
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted photos
 * @throws {CustomError} - If something goes wrong with the database
 */
async function delete_photos_by_id_user(id_user) {
  try {
    const deleted_photos = await pool.query(
      `
    DELETE FROM PHOTOEXERCISE AS e
    WHERE e.id_user = $1
    `,
      [id_user]
    );
    return deleted_photos.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Deletes all photos of a exercise by id_user and id_exercise
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @returns {Promise<Object>} - A promise of the deleted photos
 * @throws {CustomError} - If something goes wrong with the database
 */
async function delete_photos_by_id_user_id_exercise(id_user, id_exercise) {
  try {
    const deleted_photos = await pool.query(
      `
    DELETE FROM PHOTOEXERCISE AS e
    WHERE e.id_user = $1 AND e.id_exercise = $2
    `,
      [id_user, id_exercise]
    );
    return deleted_photos.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

/**
 * Delete a specific photo of specific exercise by id_user, id_exercise and public_id
 * @param {number} id_user - User's id. It must be a integer and be store in database
 * @param {number} id_exercise - Exercise's id. It must be a integer and be store in database
 * @param {number} public_id - Public id given by Cloudinary. It must be store in database
 * @returns {Promise<Object>} - A promise of the deleted photo
 * @throws {CustomError} - If something goes wrong with the database
 */
async function delete_photo_by_id_user_id_exercise_public_id(
  id_user,
  id_exercise,
  public_id
) {
  try {
    const deleted_photo = await pool.query(
      `
      DELETE FROM PHOTOEXERCISE AS p
      WHERE p.id_user = $1 AND p.id_exercise = $2 AND p.public_id = $3
      `,
      [id_user, id_exercise, public_id]
    );
    return deleted_photo.rowCount;
  } catch (error) {
    throw new CustomError(
      `Something went wrong with database. Error: ${error.message}`,
      500
    );
  }
}

module.exports = { 
  create_new_photo,//✓ //✓
  delete_photo_by_id_user_id_exercise_public_id,//✓ //✓
  delete_photos_by_id_user_id_exercise,//✓ //✓
  find_photos_by_id_user_id_exercise,//✓ //✓
  delete_photos_by_id_user,
  //✓ //✓
  find_photo_by_id_user_id_exercise_public_id
};
