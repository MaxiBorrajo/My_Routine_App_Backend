//Imports

const fs = require("fs");
const multer = require("multer");
const cloudinary = require("cloudinary");

//Methods

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
  secure: true,
});

const storage = multer.memoryStorage();

const multer_uploads = multer({ storage }).single("image");

// const upload_multer = upload.single("image");

/**
 * Delete an image file from local storage
 * @param {string} filepath - The path of the file to be deleted
 * @returns {void}
 * @throws {Error} If an error occurs in the deletion process
 */
function delete_image_from_localStorage(filepath) {
  try {
    fs.promises.unlink(filepath);
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
async function upload_image_to_cloud(file) {
  //check
  try {
    const uploaded_image = await cloudinary.v2.uploader.upload(file, {
      resource_type: "auto",
      transformation: [
        {
          width: 300,
          height: 300,
          aspect_ratio: "1:1",
          crop: "fill_pad",
          gravity: "auto",
        },
      ],
    });

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

// function run_middleware(req, res, fn) {
//   return new Promise((resolve, reject) => {
//     fn(req, res, (result) => {
//       if (result instanceof Error) {
//         return reject(result);
//       }
//       return resolve(result);
//     });
//   });
// }

/**
 * Process the image file, including resizing, uploading to the cloud, and updating the request object
 * @param {Object} req - The request object from the HTTP request
 * @param {Object} res - The response object from the HTTP response
 * @param {Function} next - The next function from Express
 * @returns {void}
 * @throws {Error} If there was an error during the whole process
 */
async function process_image(req, res, next) {
  try {

    if (!req.file) {
      return next();
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");

    let data_URI = "data:" + req.file.mimetype + ";base64," + b64;

    const cloud_info = await upload_image_to_cloud(data_URI);

    req.file.public_id = cloud_info.public_id;

    req.file.url = cloud_info.url;

    return next();
  } catch (error) {
    console.log(error);
    return next(error);
  }
}

//Exports

module.exports = {
  multer_uploads,
  process_image,
  delete_image_in_cloud,
  upload_image_to_cloud,
};
