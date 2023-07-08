const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
  secure: true,
});

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.fieldname + "-" + uniqueSuffix;
    cb(null, filename);
  },
});

const uploadMulter = multer({ storage: multerStorage });

/**
 * Delete an image file from local storage
 * @param {string} filepath - The path of the file to be deleted
 * @returns {void}
 */
function deleteImageFromLocalStorage(filepath) {
  fs.unlink(filepath, (error) => {
    if (error) {
      console.error(error);
      return;
    }
  });
}

/**
 * Resize an image using sharp library
 * @param {Object} file - The file object to be resized
 * @returns {Promise<string>} A promise that resolves with the path of the optimized image file
 */
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const optimizedFileName = `${file.fieldname}_optimize`;

    sharp(file.path)
      .resize(300, 300)
      .toFile(optimizedFileName, (error, resizeFile) => {
        if (error) {
          reject(error);
          return;
        }
        deleteImageFromLocalStorage(file.path);
        resolve(optimizedFileName);
      });
  });
}

/**
 * Upload an image file to a cloud storage using cloudinary library
 * @param {string} filepath - The path of the file to be uploaded
 * @returns {Promise<Object>} A promise that resolves with an object containing
 * the public_id and url of the uploaded image
 * @throws {Error} If there was an error during the upload process
 */
async function uploadImageToCloud(filepath) {
  try {
    const uploadedImage = await cloudinary.v2.uploader.upload(filepath);
    const uploadedImageInfo = {
      public_id: uploadedImage.public_id,
      url: uploadedImage.secure_url,
    };
    return uploadedImageInfo;
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
async function deleteImageInCloud(public_id) {
  try {
    const uploadedImage = await cloudinary.v2.uploader.destroy(public_id);
    return uploadedImage;
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
 */
function processImage(req, res, next) {
  if (!req.file) {
    return next();
  }
  resizeImage(req.file)
    .then(async (optimizedImagePath) => {
      const cloudInfo = await uploadImageToCloud(optimizedImagePath);

      deleteImageFromLocalStorage(optimizedImagePath);
      req.file.public_id = cloudInfo.public_id;
      req.file.url = cloudInfo.url;
      next();
    })
    .catch((error) => {
      next(error);
    });
}

module.exports = {
  uploadMulter,
  processImage,
  deleteImageInCloud,
};
