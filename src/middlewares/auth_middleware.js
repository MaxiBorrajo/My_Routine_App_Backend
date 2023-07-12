const {
  find_auth_by_id_user,
  update_auth,
} = require("../repositories/auth_repository");
const { find_user_by_id_user } = require("../repositories/user_repository");
const {
  create_new_invalid_token,
} = require("../repositories/invalid_token_repository");
const CustomError = require("../utils/custom_error");
const { generate_tokens } = require("../utils/user_utils");
const { are_equal, is_greater_than } = require("../utils/utils_functions");
const jwt = require("jsonwebtoken");

/**
 * Middleware that manage authentication and authorization
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If there is no refresh token or it's expired,
 * if the access or refresh token are invalid, or if something
 * goes wrong with the database
 * 
 */
async function auth_middleware(req, res, next) {
  try {
    if (!req.cookies.refresh_token) {
      return next(new CustomError("Invalid authorization", 401));
    }

    if (!req.cookies.access_token) {
      const payload = jwt.verify(
        req.cookies.refresh_token,
        process.env.REFRESH_JWT_SECRET
      );

      const new_invalid_token = {
        id_user: payload.id_user,
        token: req.cookies.refresh_token,
      };

      await create_new_invalid_token(new_invalid_token);

      const refresh_token_expiration = payload.exp;

      if (is_greater_than(refresh_token_expiration, Date.now())) {
        return next(
          new CustomError("Your session has expired. Try to login again", 401)
        );
      }

      const found_user = await find_user_by_id_user(payload.id_user);

      const found_auth = await find_auth_by_id_user(payload.id_user);

      const is_allowed_to_continue =
        is_greater_than(found_user.length, 0) &&
        is_greater_than(found_auth.length, 0) &&
        are_equal(found_auth[0].refresh_token, req.cookies.refresh_token);

      if (!is_allowed_to_continue) {
        return next(new CustomError("Invalid authorization", 401));
      }

      const { access_token, refresh_token } = generate_tokens({
        id_user: payload.id_user,
      });

      found_auth[0].refresh_token = refresh_token;

      const updated_auth = await update_auth(found_auth[0]);

      if (!are_equal(updated_auth, 1)) {
        return next(
          new CustomError(
            "Something went wrong. Authentication not created",
            500
          )
        );
      }

      res.cookie("access_token", access_token, {
        maxAge: 60 * 1000,
        httpOnly: true,
        secure: true,
      });

      res.cookie("refresh_token", refresh_token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
      });

      req.id_user = payload.id_user;

      return next();
    }

    const payload = jwt.verify(
      req.cookies.access_token,
      process.env.ACCESS_JWT_SECRET
    );

    const access_token_expiration = payload.exp;

    if (is_greater_than(access_token_expiration, Date.now())) {
      const new_invalid_token = {
        id_user: payload.id_user,
        token: req.cookies.access_token,
      };

      await create_new_invalid_token(new_invalid_token);

      return next(
        new CustomError("Your session has expired. Try to login again", 401)
      );
    }

    const found_user = await find_user_by_id_user(payload.id_user);

    if (are_equal(found_user.length, 0)) {
      return next(new CustomError("Invalid authorization", 401));
    }

    req.id_user = payload.id_user;
    
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = auth_middleware;
