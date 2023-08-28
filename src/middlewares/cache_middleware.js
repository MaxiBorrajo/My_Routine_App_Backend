//Imports

const redis = require("../config/redis_connection");

const { return_response } = require("../utils/utils_functions");

//Exports

async function get_key_type(key) {
  const result = await redis.type(key);

  return result;
}

const cache_middleware = async (req, res, next) => {
  try {
    const key = req.originalUrl;

    const key_type = await get_key_type(key);

    if (key_type === "list") {
      const cached_list = await redis.lrange(key, 0, -1);

      const parsed_list = cached_list.map((item) => JSON.parse(item));

      return return_response(res, 200, parsed_list, true);
    } else if (key_type === "string") {
      const cached_value = await redis.get(key);

      const parsed_value = JSON.parse(cached_value);

      return return_response(res, 200, parsed_value, true);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  cache_middleware,
};
