//Imports

const {
  find_exercise_by_id_user_id_exercise,
} = require("../repositories/exercise_repository");

const {
  create_new_photo,
  delete_photo_by_id_user_id_exercise_public_id,
  find_photos_by_id_user_id_exercise,
  find_photo_by_id_user_id_exercise_public_id,
} = require("../repositories/photo_repository");

const CustomError = require("../utils/custom_error");

const { return_response, are_equal } = require("../utils/utils_functions");

const {
  delete_image_in_cloud,
} = require("../middlewares/upload_images_middleware");

//Methods

/**
 * Controller that uploads a new photo associated to an exercise
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the exercise is not found,if no photo is sent,
 * if something goes wrong while uploading the photo, or if something goes wrong with the
 * database
 */
async function create_photo(req, res, next) {
  try {
    if (!req.file) {
      throw new CustomError("You must send a photo", 400);
    }

    await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    const new_photo = {
      id_user: req.id_user,
      id_exercise: req.params.id_exercise,
      public_id: req.file.public_id,
      url_photo: req.file.url,
    };

    await create_new_photo(new_photo);

    return return_response(
      res,
      201,
      { message: "Photo uploaded successfully" },
      true
    );
  } catch (error) {
    if (req.file && req.file.public_id) {
      await delete_image_in_cloud(req.file.public_id);
    }
    next(error);
  }
}

/**
 * Controller that finds all photos of an exercise
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the exercise is not found or if something
 * goes wrong with the database
 */
async function find_all_photos_of_exercise(req, res, next) {
  try {
    await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    const found_photos = await find_photos_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    return return_response(res, 200, found_photos, true);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller that deletes a photo associated to an exercise
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the exercise is not found,
 * if the photo is not found, or if something
 * goes wrong with the database
 */
async function delete_photo_associated_to_exercise(req, res, next) {
  try {
    await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    await find_photo_by_id_user_id_exercise_public_id(
      req.id_user,
      req.params.id_exercise,
      req.params.public_id
    );

    await delete_photo_by_id_user_id_exercise_public_id(
      req.id_user,
      req.params.id_exercise,
      req.params.public_id
    );

    await delete_image_in_cloud(req.params.public_id);

    return return_response(
      res,
      200,
      { message: "Photo deleted successfully" },
      true
    );
  } catch (error) {
    next(error);
  }
}

//Exports

module.exports = {
  create_photo,
  find_all_photos_of_exercise,
  delete_photo_associated_to_exercise,
};
