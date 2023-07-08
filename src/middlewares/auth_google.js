const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const { create_new_user, find_user_by_email } = require("../controllers/user_controller");
const CustomError = require("../utils/custom_error");

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
        const found_user = await find_user_by_email(profile.email);

        if (found_user.rowCount === 0) {
          const new_user = {
            email: profile.email,
            name: profile.given_name,
            lastName: profile.family_name,
            username: profile.displayName,
            urlProfilePhoto: profile.picture,
            password: "",
            date_birth: "1900-01-01",
            theme: "light",
            experience: "beginner",
            weight: "KG",
            goal: "",
          };

          await create_new_user(new_user);
          return done(null, new_user);
        }

        return done(null, found_user.rows[0]);

      } catch (error) {
        return done(
          new CustomError(`Something went wrong. Error: ${error.message}`, 500)
        );
      }
    }
  )
);

passport.serializeUser(
  function (user, done) {
    try {
      done(null, user);
    } catch (error) {
      return done(
        new CustomError(`Something went wrong. Error: ${error.message}`, 500)
      );
    }
  }
);

passport.deserializeUser(
  function (user, done) {
    try {
      done(null, user);
    } catch (error) {
      return done(
        new CustomError(`Something went wrong. Error: ${error.message}`, 500)
      );
    }
  }
);
