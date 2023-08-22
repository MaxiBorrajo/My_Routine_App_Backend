//Imports

const NodeCache = require("node-cache");

//Variables

const cache = new NodeCache();

//Exports

module.exports = (duration) => (req, res, next) => {
  const key = req.originalUrl;

  const cached_response = cache.get(key);

  if (cached_response) {
    res.send(cached_response);
  } else {
    res.originalSend = res.send;

    res.send = (body) => {
      res.originalSend(body);
      
      cache.set(key, body, duration);
    };

    next();
  }
};
