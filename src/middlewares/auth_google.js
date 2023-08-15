//Imports
const passport = require("passport");

const GoogleStrategy = require("passport-google-oauth2").Strategy;

const {
  create_new_user,
  find_user_by_email,
  update_user,
} = require("../repositories/user_repository");

const {
  upload_image_to_cloud,
} = require("../middlewares/upload_images_middleware");

const { are_equal } = require("../utils/utils_functions");

const CustomError = require("../utils/custom_error");

//Methods

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/v1/user/google/redirect",
      passReqToCallback: true,
    },
    /**
     * Passport google authentication strategy callback. Searches with the information given
     * by the authentication a user stored in database, if it is found, executes done function, if it is not
     * creates one and then executes done.
     * @param {Object} request - Request's object from the http request
     * @param {string} accessToken - Access token from google authentication
     * @param {string} refreshToken - Refresh token from google authentication
     * @param {Object} profile - User's google profile
     * @param {Function} done - Callback function that finish the authentication
     * @returns {Promise<void>} - Promise resolved when authentication is complete
     * @throws {CustomError} - If something goes wrong with the authentication or with the database
     */
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        const user = await find_user_by_email(profile.email);

        if (are_equal(user.length, 0)) {
          const profile_photo = await upload_image_to_cloud(profile.picture);

          const new_user = {
            email: profile.email,
            name: profile.given_name,
            last_name: profile.family_name,
            password: "",
          };

          await create_new_user(new_user);

          let found_user = await find_user_by_email(profile.email);

          found_user[0].username = profile.displayName;

          found_user[0].public_id_profile_photo = profile_photo.public_id;

          found_user[0].url_profile_photo = profile_photo.url;

          await update_user(found_user[0]);

          return done(null, found_user[0]);
        }

        return done(null, user[0]);
      } catch (error) {
        return done(new CustomError(error.message, 500));
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  try {
    done(null, user);
  } catch (error) {
    return done(new CustomError(error.message, 500));
  }
});

passport.deserializeUser(function (user, done) {
  try {
    done(null, user);
  } catch (error) {
    return done(new CustomError(error.message, 500));
  }
});
