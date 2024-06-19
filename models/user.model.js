const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      minLength: 2,
      maxlength: 30,
    },

    username: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 20,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      maxlength: 1024,
    },

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator);

module.exports = User = mongoose.model("User", userSchema);
