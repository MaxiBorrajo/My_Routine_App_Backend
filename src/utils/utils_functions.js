/**
 * Function that sees if first_parameter is equal to second_parameter.
 * @param {any} first_parameter - The first parameter to evaluate.
 * @param {any} second_parameter - The second parameter to evaluate.
 * @returns {boolean} True if parameters are equal, false otherwise.
 */
function are_equal(first_parameter, second_parameter) {
  return first_parameter === second_parameter;
}

/**
 * Function that sees if first_parameter is greater to second_parameter.
 * @param {number} first_parameter - The first parameter to evaluate.
 * @param {number} second_parameter - The second parameter to evaluate.
 * @returns {boolean} True if first_parameter is greater to second_parameter, false otherwise.
 */
function is_greater_than(first_parameter, second_parameter) {
  return first_parameter > second_parameter;
}

/**
 * Function that sees if first_parameter is lesser to second_parameter.
 * @param {number} first_parameter - The first parameter to evaluate.
 * @param {number} second_parameter - The second parameter to evaluate.
 * @returns {boolean} True if first_parameter is lesser to second_parameter, false otherwise.
 */
function is_lesser_than(first_parameter, second_parameter) {
  return first_parameter < second_parameter;
}

/**
 * Function that sees if first_parameter is greater or equal to second_parameter.
 * @param {number} first_parameter - The first parameter to evaluate.
 * @param {number} second_parameter - The second parameter to evaluate.
 * @returns {boolean} True if first_parameter is greater or equal to second_parameter, false otherwise.
 */
function is_greater_or_equal_than(first_parameter, second_parameter) {
  return first_parameter >= second_parameter;
}

/**
 * Function that sees if first_parameter is lesser or equal to second_parameter.
 * @param {number} first_parameter - The first parameter to evaluate.
 * @param {number} second_parameter - The second parameter to evaluate.
 * @returns {boolean} True if first_parameter is lesser or equal to second_parameter, false otherwise.
 */
function is_lesser_or_equal_than(first_parameter, second_parameter) {
  return first_parameter <= second_parameter;
}

/**
 * Function that deletes an specific element from an array.
 * @param {any} element - The element to delete from the array
 * @param {Array} array - The array in which delete the element.
 * @returns {Array} If element is in the array, returns array without element,
 * if not, returns array without changes.
 */

function delete_element_from_array(element, array) {
  const index = array.indexOf(element);
  if (index !== -1) {
    array.splice(index, 1);
  }
  return array;
}

/**
 * Function that return a success response with a status, resource and links given.
 * @param {Object} res - The response object from the HTTP response.
 * @param {number} status - The status of the HTTP response. Must be an integer.
 * @param {any} resource - The resource to send to the cliente.
 * @returns {Object} The response object from the HTTP response
 */
function return_response(res, status, resource, success) {
  return res
    .status(status)
    .json({ success: success, resource: resource});
}


module.exports = {
  are_equal,
  is_greater_than,
  is_lesser_than,
  is_greater_or_equal_than,
  is_lesser_or_equal_than,
  delete_element_from_array,
  return_response,
};
