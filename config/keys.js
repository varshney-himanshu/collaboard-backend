require("dotenv").config();

const keys = {
  mongo_db_uri: process.env.MONGO_URI,
};

module.exports = keys;
