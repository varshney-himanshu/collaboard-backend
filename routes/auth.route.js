const { Router } = require("express");
const authRouter = Router();
const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const { generateJWTToken } = require("../utils/auth.utils.js");
const passport = require("passport");
const _ = require("lodash");

//MARK: login
authRouter.get("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    let existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res.status(400).json({
        status: 400,
        message: "Email or Password is invalid",
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (isMatch) {
      const payload = {
        id: existingUser._id,
        username: existingUser.username,
        role: existingUser.role,
      };

      let token = generateJWTToken(payload);
      token = "Bearer " + token;

      res.json({ status: 200, token: token });
    } else {
      return res.status(400).json({
        status: 400,
        message: "Email or Password is invalid",
      });
    }
  } catch (e) {
    console.error("Error: ", e);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
});

//MARK: registration
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

    return res.status(201).json({
      status: 201,
      message: "new user created successfully",
    });
  } catch (e) {
    console.error("Error in finding user in db: ", e);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
});

//MARK: current user
authRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),

  async (req, res) => {
    const { _id } = req.user;

    try {
      const user = await User.findOne({ _id });
      if (user) {
        res.status(200).json({
          status: 200,
          data: _.pick(user, ["full_name", "username", "role", "_id"]),
        });
      }
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

module.exports = authRouter;
