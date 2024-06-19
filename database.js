const mongoose = require("mongoose");
const keys = require("./config/keys");

class Database {
  async start() {
    try {
      const response = await mongoose.connect(keys.mongo_db_uri, {});
      console.log("DB connected successfully");
    } catch (e) {
      console.error("Error in connecting to the DB: ", e);
    }
  }

  get mongooseInstance() {
    return mongoose;
  }

  close() {
    mongoose.disconnect();
  }
}

module.exports = Database;
