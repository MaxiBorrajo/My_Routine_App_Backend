const { Redis } = require("ioredis");

const redis = new Redis(process.env.KV_URL)

module.exports = redis;