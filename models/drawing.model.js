const mongoose = require("mongoose");

const strokeSchema = new mongoose.Schema({
  pX: {
    type: Number,
    required: true,
  },
  pY: {
    type: Number,
    require: true,
  },
  cX: {
    type: Number,
    required: true,
  },
  cY: {
    type: Number,
    require: true,
  },

  color: {
    type: String,
    enum: ["#000000", "#FF0000", "#FFFF00", "#00FF00", "#FFFFFF"],
    default: "#000000",
  },

  length: {
    type: Number,
    default: 1,
  },
});

const drawingSchema = new mongoose.Schema(
  {
    board_id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },

    strokes: {
      type: [strokeSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = Drawing = mongoose.model("Drawing", drawingSchema);
