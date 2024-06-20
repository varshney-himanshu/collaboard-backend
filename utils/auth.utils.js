const jwt = require("jsonwebtoken");
const { secret_or_key } = require("../config/keys");

function generateJWTToken(payload) {
  return jwt.sign(payload, secret_or_key, { expiresIn: 63070000 });
}

module.exports = {
  generateJWTToken,
};
