//Imports

const express = require("express");

const router = express.Router();

const {cache_middleware} = require("../middlewares/cache_middleware");

const {
  create_photo,
  find_all_photos_of_exercise,
  delete_photo_associated_to_exercise
} = require("../controllers/photo_controller");

const {
  upload_multer,
  process_image,
} = require("../middlewares/upload_images_middleware");

const auth_middleware = require("../middlewares/auth_middleware");

const check_invalid_tokens_middleware = require("../middlewares/invalid_token_middleware");

//Routes

/**
 * POST route to upload a new photo of an exercise
 *
 * @route {POST} /v1/photo/exercise/:id_exercise
 * @body {File} image
 * @throws {CustomError} - If the exercise isn't found or
 * if something goes wrong while uploading the photo
 */
router.post(
  "/exercise/:id_exercise",
  upload_multer,
  process_image,
  check_invalid_tokens_middleware,
  auth_middleware,
  create_photo
);

/**
 * GET route to find all photos associated to an exercise
 *
 * @route {GET} /v1/photo/exercise/:id_exercise
 *
 * @throws {CustomError} - If the exercise isn't found or
 * if something goes wrong with the database
 */
router.get(
  "/exercise/:id_exercise",
  check_invalid_tokens_middleware,
  auth_middleware,
  cache_middleware,
  find_all_photos_of_exercise
);

/**
 * DELETE route to delete photo associated to an exercise
 *
 * @route {DELETE} /v1/photo/:public_id/exercise/:id_exercise
 *
 * @throws {CustomError} - If the exercise isn't found,
 * if the photo isn't found, or
 * if something goes wrong with the database
 */
router.delete(
    "/:public_id/exercise/:id_exercise",
    check_invalid_tokens_middleware,
    auth_middleware,
    delete_photo_associated_to_exercise
  );

module.exports = router;
