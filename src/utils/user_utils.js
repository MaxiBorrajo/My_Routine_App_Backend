//Imports

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const {
  create_new_auth,
  update_auth,
  find_auth_by_id_user,
} = require("../repositories/auth_repository");

const { return_response, are_equal } = require("../utils/utils_functions");

const CustomError = require("../utils/custom_error");

//Methods

/**
 * Function that encrypts a given password
 * @param {string} password - A password to encrypt
 * @returns {string} The given password encrypted
 */
async function encrypt_password(password) {
  const salt = await bcrypt.genSalt(10);

  const encrypted_password = await bcrypt.hash(password, salt);

  return encrypted_password;
}

/**
 * Function that sees if the given password is the same as one encrypted
 * @param {string} password - The password to check
 * @param {string} encrypted_password - The encrypted password to compare with
 * @returns {boolean} True if they are the same, false otherwise
 */
async function match_passwords(password, encrypted_password) {
  return await bcrypt.compare(password, encrypted_password);
}

/**
 * Function that generates an access token and a refresh token with the data given to it
 * @param {any} data - Any piece of data
 * @returns {Object} An object that contains the access token and the refresh token
 */
function generate_tokens(data) {
  const access_token = jwt.sign(data, process.env.ACCESS_JWT_SECRET, {
    expiresIn: 2 * 60 * 1000,
  });

  const refresh_token = jwt.sign(data, process.env.REFRESH_JWT_SECRET, {
    expiresIn: 7 * 24 * 60 * 60 * 1000,
  });

  const tokens = {
    access_token: access_token,
    refresh_token: refresh_token,
  };

  return tokens;
}

/**
 * Function that generates a password reset token and an expiration
 * to use when a password change is requested
 * @param {number} id_user - User's id of the user that wants to change his password
 * @returns {Object} An object that contains the reset password token and its expiration
 */
function get_reset_password_token(id_user) {
  try {
    const payload = {
      id_user: id_user,
    };

    const reset_password_token = jwt.sign(
      payload,
      process.env.ACCESS_JWT_SECRET
    );

    const reset_password_token_data = {
      reset_password_token: reset_password_token,
      reset_password_token_expiration: new Date(Date.now() + 10 * 60 * 1000),
    };

    return reset_password_token_data;
  } catch (error) {
    throw error;
  }
}

/**
 * Function that manages the authorization of a user and returns in cookies
 * an access token, refresh token and in a response the information of the user
 * @param {Object} user - Information of the user to give authorization
 * @param {Object} res - The response object from the HTTP response
 * @param {Function} next - The next function in the middleware chain
 * @returns {Object} A response object with the user's information
 * @throws {CustomError} If the user isn't found in database or if authentication
 * cannot be sent
 */
async function get_authorization(user, res, next, is_from_google) {
  try {
    const { access_token, refresh_token } = generate_tokens({
      id_user: user.id_user,
    });

    let found_auth = await find_auth_by_id_user(user.id_user);

    if (are_equal(found_auth.length, 0)) {
      const new_auth = {
        id_user: user.id_user,
        reset_password_token: "",
        reset_password_token_expiration: new Date(Date.now()).toISOString(),
        refresh_token: refresh_token,
      };

      const created_auth = await create_new_auth(new_auth);

      if (!are_equal(created_auth, 1)) {
        throw new CustomError("Authentication could not be created", 500);
      }
    } else {
      found_auth[0].refresh_token = refresh_token;

      const updated_auth = await update_auth(found_auth[0]);

      if (!are_equal(updated_auth, 1)) {
        throw new CustomError("Authentication could not be created", 500);
      }
    }

    res.cookie("_access_token", access_token, {
      maxAge: 120 * 1000,
      sameSite: "None",
      secure: true,
    });

    res.cookie("_refresh_token", refresh_token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
    });

    res.cookie("_is_logged_in", true, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
    });

    delete user.password;

    delete user.id_user;

    const status = are_equal(found_auth.length, 0) ? 201 : 200;

    if (!is_from_google) {
      return return_response(res, status, user, true);
    }
    res.redirect("http://localhost:5173/dashboard");
  } catch (error) {
    next(error);
  }
}

//Exports

module.exports = {
  encrypt_password,
  match_passwords,
  generate_tokens,
  get_reset_password_token,
  get_authorization,
};
