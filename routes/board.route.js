const { Router } = require("express");
const boardRouter = Router();
const Drawing = require("../models/drawing.model.js");
const Board = require("../models/board.model.js");
const passport = require("passport");
const _ = require("lodash");

boardRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const boards = await Board.find({ owner_id: req.user._id });
      return res.status(200).json({
        status: 200,
        data: boards.map((item) =>
          _.pick(item, ["size", "title", "collaborators", "owner_id", "_id"])
        ),
      });
    } catch (e) {
      console.error("Error: ", e);
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    }
  }
);

boardRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { title, size } = req.body;

    try {
      const newBoard = new Board({
        title,
        size,
        owner_id: req.user._id,
      });

      const newCreatedBoard = await newBoard.save();

      const newDrawing = new Drawing({
        board_id: newCreatedBoard._id,
      });

      const newCreateDrawing = await newDrawing.save();

      return res.status(201).json({
        status: 201,
        data: { board: newCreatedBoard, drawing: newCreateDrawing },
      });
    } catch (e) {
      console.error("Error: ", e);
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    }
  }
);

module.exports = boardRouter;
