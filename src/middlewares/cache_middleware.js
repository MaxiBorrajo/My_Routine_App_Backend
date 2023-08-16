//Imports

const getExpeditiousCache = require("express-expeditious");

//Variables

const default_options = {
  namespace: "expresscache",
  defaultTtl: "1 minute",
  statusCodeExpires: {
    404: 0,
    400: 0,
    401: 0,
    403: 0,
    500: 0,
  }
};

//Methods

const cache_middleware = getExpeditiousCache(default_options);

//Exports

module.exports = { cache_middleware };
