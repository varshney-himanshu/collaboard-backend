const { Router } = require("express");

const authRouter = Router();
const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
authRouter.get("/", (req, res) => {
  res.json({ status: "OK" });
});

authRouter.post("/register", async (req, res) => {
  const { full_name, username, password } = req.body;

  try {
    let existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        status: 409,
        message: "User already exist. Please try another username.",
      });
    }

    var newUser = new User({
      full_name,
      username,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newUser.password, salt);

    newUser.password = hash;
    const user = await newUser.save();
    console.log("new user created", user);

    return res
      .json({
        status: 201,
        message: "new user created successfully",
        user: user,
      })
      .status(201);
  } catch (e) {
    console.error("Error in finding user in db: ", e);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
});

module.exports = authRouter;
