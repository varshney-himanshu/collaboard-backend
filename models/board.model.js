const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      minLength: 2,
      maxlength: 100,
    },

    size: {
      width: {
        type: Number,
        required: true,
      },
      height: {
        type: Number,
        required: true,
      },
    },

    owner_id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },

    collaborators: {
      type: [mongoose.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = Board = mongoose.model("Board", boardSchema);
