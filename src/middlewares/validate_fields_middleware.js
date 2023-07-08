const CustomError = require("../utils/custom_error");
const { are_equal } = require("../utils/utils_functions");
const _ = require("lodash");

/**
 * Middleware function that checks if the body of the request meets certain requirements.
 * Requirements:
 * - The body must have an 'email' attribute.
 * - The 'email' attribute, if present, must be a valid email address.
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the body of the request doesn't meet the requirements.
 */
function meets_with_email_requirements(req, res, next) {
  const email = req.body.email;
  if (!email) {
    return next(new CustomError("An 'email' attribute is required", 400));
  }

  const regular_expression_email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regular_expression_email.test(email)) {
    return next(
      new CustomError(
        "The value of the 'email' attribute must be a valid email address",
        422
      )
    );
  }

  return next();
}

/**
 * Middleware function that checks if the body of the request meets certain requirements.
 * Requirements:
 * - The body must have an 'password' attribute.
 * - The 'password' attribute, if present, must be have
 * at least one lowercase letter, one uppercase letter,
 * one digit, one special character, and be 8 characters or longer.
 *
 * @param {Object} req - The request object from the HTTP request.
 * @param {Object} res - The response object from the HTTP response.
 * @param {Function} next - The next function in the middleware chain.
 * @throws {CustomError} If the body of the request doesn't meet the requirements.
 */
function meets_with_password_requirements(req, res, next) {
  const password = req.body.password;
  if (!password) {
    return next(new CustomError("A 'password' attribute is required", 400));
  }
  const regular_expression_password =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!regular_expression_password.test(password)) {
    return next(
      new CustomError(
        "The value of 'password' attribute must have at least one lowercase letter, one uppercase letter, one digit, one special character, and be 8 characters or longer.",
        422
      )
    );
  }
  return next();
}

/**
 * Creates a middleware function that checks if the body of the request does not contain specified attributes.
 *
 * @param {string[]} attributes_to_exclude - An array of attribute names that should not be present in the request body.
 * @returns {Function} - A middleware function that checks the presence of the specified attributes.
 * @throws {CustomError} - If any of the excluded attributes are found in the request body.
 */
function body_must_not_contain_attributes(attributes_to_exclude) {
  /**
   * Middleware function that checks if the body of the request does not contain specified attributes.
   *
   * @param {Object} req - The request object from the HTTP request.
   * @param {Object} res - The response object from the HTTP response.
   * @param {Function} next - The next function in the middleware chain.
   * @throws {CustomError} - If any of the excluded attributes are found in the request body.
   */
  return function (req, res, next) {
    const body_attributes = Object.keys(req.body);
    const found_attribute = body_attributes.find((attribute) =>
      attributes_to_exclude.includes(attribute)
    );
    if (found_attribute) {
      return next(
        new CustomError(
          `The attribute '${found_attribute}' is not allowed`,
          400
        )
      );
    }
    return next();
  };
}


/**
 * Creates a middleware function that checks if the body of the request does contain specified attributes.
 *
 * @param {string[]} must_attributes - An array of attribute names that must be present in the request body.
 * @returns {Function} - A middleware function that checks the presence of the specified attributes.
 * @throws {CustomError} - If any of the must attributes are not found in the request body.
 */
function body_must_contain_attributes(must_attributes) {
  /**
   * Middleware function that checks if the body of the request does contain the specified attributes.
   *
   * @param {Object} req - The request object from the HTTP request.
   * @param {Object} res - The response object from the HTTP response.
   * @param {Function} next - The next function in the middleware chain.
   * @throws {CustomError} - If any of the must attributes are not found in the request body.
   */
  return function (req, res, next) {
    const body_attributes = Object.keys(req.body);
    if (!are_equal(body_attributes.sort(), must_attributes.sort())) {
      const missing_attributes = _.difference(must_attributes, body_attributes);
      return next(
        new CustomError(
          `The body is missing the following attributes ${missing_attributes}`,
          400
        )
      );
    }
    return next();
  };
}

module.exports = {
  meets_with_email_requirements,
  meets_with_password_requirements,
  body_must_not_contain_attributes,
  body_must_contain_attributes
};
