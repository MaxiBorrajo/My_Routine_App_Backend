//imports
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const app = express();
const morgan = require("morgan");
const cookie_parser = require("cookie-parser");
const cors = require("cors");
const passport = require("passport");
const error_handler_middleware = require("./src/middlewares/error_handler_middleware");
const user_controller = require("./src/controllers/user_controller");
const upload_images_middleware = require("./src/middlewares/upload_images_middleware");
//dependencies
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cookie_parser());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//routes
app.use(
  express.Router().post(
    "/",
    upload_images_middleware.uploadMulter.single("image"),
    (req, res, next) => {
      upload_images_middleware.processImage(req, res, next);
    },
    async (req, res, next) => {
      try {
        const user = await user_controller.find_user_by_idUser(req.body.iduser);
        if (user.length <= 0) {
          return res.status(404).send("User not found");
        }
        const new_user_information = {
          iduser: user[0].iduser,
          email: req.body.email ? req.body.email : user[0].email,
          name: req.body.name ? req.body.name : user[0].name,
          last_name: req.body.last_name
            ? req.body.last_name
            : user[0].last_name,
          username: req.body.username ? req.body.username : user[0].username,
          public_id_profile_photo: req.file.public_id
            ? req.file.public_id
            : user[0].public_id_profile_photo,
          url_profile_photo: req.file.url
            ? req.file.url
            : user[0].url_profile_photo,
          password: req.body.password ? req.body.password : user[0].password,
          date_birth: req.body.date_birth
            ? req.body.date_birth
            : user[0].date_birth,
          theme: req.body.theme ? req.body.theme : user[0].theme,
          experience: req.body.experience
            ? req.body.experience
            : user[0].experience,
          weight: req.body.weight ? req.body.weight : user[0].weight,
          goal: req.body.goal ? req.body.goal : user[0].goal,
        };

        if (req.file && user[0].public_id_profile_photo) {
          await upload_images_middleware.deleteImageInCloud(
            user[0].public_id_profile_photo
          );
        }

        const response = await user_controller.update_user(
          new_user_information
        );

        res.status(200).send(response);
      } catch (error) {
        next(error);
      }
    }
  )
);

//global middlewares
app.use(error_handler_middleware);

//exports
module.exports = app;
