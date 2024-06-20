require("dotenv").config();

const keys = {
  mongo_db_uri: process.env.MONGO_URI,
  secret_or_key: process.env.JWT_SECRET,
};

module.exports = keys;
