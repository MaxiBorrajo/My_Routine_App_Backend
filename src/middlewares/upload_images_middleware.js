//Imports

const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("cloudinary");

//Methods

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
  secure: true,
});

const multer_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "");
  },
  filename: function (req, file, cb) {
    const unique_suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.fieldname + "-" + unique_suffix;
    cb(null, filename);
  },
});

const upload_multer = multer({ storage: multer_storage });

/**
 * Delete an image file from local storage
 * @param {string} filepath - The path of the file to be deleted
 * @returns {void}
 * @throws {Error} If an error occurs in the deletion process
 */
function delete_image_from_localStorage(filepath) {
  try {
    fs.unlinkSync(filepath);
  } catch (error) {
    throw error;
  }
}

/**
 * Resize an image using sharp library
 * @param {Object} file - The file object to be resized
 * @returns {Promise<string>} A promise that resolves with the path of the optimized image file
 * @throws {Error} If an error occurs in the resize process
 */
function resize_image(file) {
  try {
    return new Promise((resolve, reject) => {
      const optimized_filename = `${file.fieldname}_optimize`;

      sharp(file.path)
        .resize(300)
        .toFile(optimized_filename, (error, resize_file) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(optimized_filename);
        });
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Upload an image file to a cloud storage using cloudinary library
 * @param {string} filepath - The path of the file to be uploaded
 * @returns {Promise<Object>} A promise that resolves with an object containing
 * the public_id and url of the uploaded image
 * @throws {Error} If there was an error during the upload process
 */
async function upload_image_to_cloud(filepath) {
  //check
  try {
    const uploaded_image = await cloudinary.v2.uploader.upload(filepath);

    const uploaded_image_info = {
      public_id: uploaded_image.public_id,
      url: uploaded_image.secure_url,
    };

    return uploaded_image_info;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete an image file in cloud storage using cloudinary library
 * @param {string} public_id - The public id of the file to be deleted
 * @returns {Promise<Object>} A promise that resolves with an object containing
 * the result of the removal
 * @throws {Error} If there was an error during the upload process
 */
async function delete_image_in_cloud(public_id) {
  //check
  try {
    const deleted_image = await cloudinary.v2.uploader.destroy(public_id);

    return deleted_image;
  } catch (error) {
    throw error;
  }
}

/**
 * Process the image file, including resizing, uploading to the cloud, and updating the request object
 * @param {Object} req - The request object from the HTTP request
 * @param {Object} res - The response object from the HTTP response
 * @param {Function} next - The next function from Express
 * @returns {void}
 * @throws {Error} If there was an error during the whole process
 */
function process_image(req, res, next) {
  if (!req.file) {
    return next();
  }

  resize_image(req.file)
    .then(async (optimized_image_path) => {
      const cloud_info = await upload_image_to_cloud(optimized_image_path);

      delete_image_from_localStorage(req.file.path);

      delete_image_from_localStorage(optimized_image_path);

      req.file.public_id = cloud_info.public_id;

      req.file.url = cloud_info.url;

      next();
    })
    .catch((error) => {
      next(error);
    });
}

//Exports

module.exports = {
  upload_multer,
  process_image,
  delete_image_in_cloud,
  upload_image_to_cloud,
};
