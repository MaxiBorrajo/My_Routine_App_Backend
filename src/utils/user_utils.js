const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function encrypt_password(password) {
  const salt = await bcrypt.genSalt(10);
  const encrypted_password = await bcrypt.hash(password, salt);
  return encrypted_password;
}

async function match_passwords(password, store_password) {
  return await bcrypt.compare(password, store_password);
}

async function generate_tokens(user_data) {
  const access_token = jwt.sign(user_data, process.env.ACCESS_JWT_SECRET, {
    expiresIn: "120 s",
  });

  const refresh_token = jwt.sign(user_data, process.env.REFRESH_JWT_SECRET, {
    expiresIn: "7d",
  });

  const tokens = {
    access_token: access_token,
    refresh_token: refresh_token,
  };

  return tokens;
}

module.exports = {
    encrypt_password,
    match_passwords,
    generate_tokens
}
