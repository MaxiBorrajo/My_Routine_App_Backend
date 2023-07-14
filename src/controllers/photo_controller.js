const {
  find_exercise_by_id_user_id_exercise,
} = require("../repositories/exercise_repository");
const {
  create_new_photo,
  delete_photo_by_id_user_id_exercise_public_id,
  delete_photos_by_id_user,
  delete_photos_by_id_user_id_exercise,
  find_photos_by_id_user_id_exercise,
  find_photo_by_id_user_id_exercise_public_id,
} = require("../repositories/photo_repository");
const CustomError = require("../utils/custom_error");
const {
  return_response,
  is_greater_than,
  are_equal,
} = require("../utils/utils_functions");
const {
  delete_image_in_cloud,
} = require("../middlewares/upload_images_middleware");

/**
 * Controller that uploads a new photo associated to an exercise
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the exercise is not found, if something goes
 * wrong while uploading the photo, or if something goes wrong with the
 * database
 */
async function create_photo(req, res, next) {
  try {
    if (!req.file) {
      return next(new CustomError("You must send a photo", 400));
    }

    const found_exercise = await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    if (are_equal(found_exercise.length, 0)) {
      await delete_image_in_cloud(req.file.public_id);
      return next(new CustomError("Exercise not found", 404));
    }

    const new_photo = {
      id_user: req.id_user,
      id_exercise: req.params.id_exercise,
      public_id: req.file.public_id,
      url_photo: req.file.url,
    };

    const created_photo = await create_new_photo(new_photo);

    if (are_equal(created_photo, 0)) {
      await delete_image_in_cloud(req.file.public_id);
      return next(new CustomError("Photo could not be uploaded", 404));
    }

    return return_response(
      res,
      201,
      { message: "Photo uploaded succesfully" },
      true
    );
  } catch (error) {
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
  const found_exercise = await find_exercise_by_id_user_id_exercise(
    req.id_user,
    req.params.id_exercise
  );

  if (are_equal(found_exercise.length, 0)) {
    await delete_image_in_cloud(req.file.public_id);
    return next(new CustomError("Exercise not found", 404));
  }

  const found_photos = await find_photos_by_id_user_id_exercise(
    req.id_user,
    req.params.id_exercise
  );

  return return_response(res, 200, found_photos, true);
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
    const found_exercise = await find_exercise_by_id_user_id_exercise(
      req.id_user,
      req.params.id_exercise
    );

    if (are_equal(found_exercise.length, 0)) {
      return next(new CustomError("Exercise not found", 404));
    }

    const found_photo = await find_photo_by_id_user_id_exercise_public_id(
      req.id_user,
      req.params.id_exercise,
      req.params.public_id
    );

    if (are_equal(found_photo.length, 0)) {
      return next(new CustomError("Photo not found", 404));
    }

    const deleted_photo = await delete_photo_by_id_user_id_exercise_public_id(
      req.id_user,
      req.params.id_exercise,
      req.params.public_id
    );

    if (are_equal(deleted_photo, 0)) {
      return next(new CustomError("Photo could not deleted", 500));
    }

    await delete_image_in_cloud(req.params.public_id);

    return return_response(
      res,
      200,
      { message: "Photo deleted succesfully" },
      true
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create_photo,
  find_all_photos_of_exercise,
  delete_photo_associated_to_exercise,
};
