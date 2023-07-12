const {
  find_invalid_tokens_by_token,
} = require("../repositories/invalid_token_repository");
const { is_greater_than } = require("../utils/utils_functions");
const CustomError = require("../utils/custom_error");

/**
 * Middleware that checks if a token has been used before
 *
 * @param {String} token - a Json Web Token to check
 * @param {Function} next - The next function in the middleware chain
 * @returns {boolean} if the token is repeaped or not
 * @throws {CustomError} If something goes wrong with the database
 */
async function is_token_repeated(token, next) {
  try {
    const found_invalid_token = await find_invalid_tokens_by_token(token);
    return is_greater_than(found_invalid_token.length, 0);
  } catch (error) {
    return next(error);
  }
}

/**
 * Middleware function that checks if the actual Json Web Token
 * has been used.
 *
 * @param {Object} req - The request object from the HTTP request
 * @param {Object} res - The response object from the HTTP response
 * @param {Function} next - The next function in the middleware chain
 * @throws {CustomError} If the Json Web Token it was already used
 */
async function check_invalid_tokens_middleware(req, res, next) {
  const refresh_token = req.cookies.refresh_token;
  const access_token = req.cookies.access_token;
  if (
    (req.cookies.refresh_token &&
      (await is_token_repeated(refresh_token, next))) ||
    (req.cookies.access_token && (await is_token_repeated(access_token, next)))
  ) {
    return next(new CustomError("Invalid token", 401));
  }
  return next();
}

module.exports = check_invalid_tokens_middleware;
