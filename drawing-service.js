const { Server } = require("socket.io");
const Board = require("./models/board.model");
const Drawing = require("./models/drawing.model");
const async = require("async");

class DrawingService {
  constructor(backendServer) {
    try {
      this.io = new Server(backendServer);

      /** MARK: strokes
       *  TODO: ADD support for storing strokes for different boards
       */
      this.strokes = {};
      this.locks = {};
      this.queue = this.createQueue();

      this.io.on("connection", (socket) => {
        console.log(`socket id:${socket.id} connected`);

        socket.emit("connect-success", { data: this.strokes });

        socket.on("join-board", async ({ board_id }) => {
          socket.join(board_id);

          if (!this.strokes[board_id]) {
            this.strokes[board_id] = [];
            console.log("no strokes found creating new array");
          }

          /**
           * TODO: add logic for new member joined
           */
          socket.broadcast.to(board_id).emit("new-user-joined", {});

          try {
            const drawing = await Drawing.findOne({ board_id });
            socket.emit("join-board-success", { data: drawing.strokes });
          } catch (e) {
            console.error("Error in finding board data");
          }
        });

        socket.on("write", ({ stroke, board_id }) => {
          this.handleOnWriteStroke(stroke, socket, board_id);
        });

        socket.on("disconnect", () => {
          console.log(`socket id:${socket.id} disconnected`);
        });
      });

      setInterval(async () => {
        await this.saveStrokesToDatabase();
      }, 1000);
    } catch (e) {
      console.error("Could not create socket server - ", e);
    }
  }

  createQueue() {
    return async.queue((taskData, callback) => {
      const { board_id, stroke, socket } = taskData;

      this.strokes[board_id].push(stroke);

      socket.broadcast.to(board_id).emit("write-update", stroke);

      callback();
    }, 1);
  }

  handleOnWriteStroke = (stroke, socket, board_id) => {
    this.queue.push({ stroke, socket, board_id }, (err) => {
      if (err) {
        console.error("Error processing queue task:", err);
      }
    });
  };

  async saveStrokesToDatabase() {
    try {
      const boards = Object.keys(this.strokes);
      for (let board_id of boards) {
        if (this.strokes[board_id].length > 0) {
          await this.saveBoardStrokes(board_id);
        }
      }
    } catch (e) {
      console.error("Error in saving data to the database:", e);
    }
  }

  async saveBoardStrokes(board_id) {
    if (this.locks[board_id]) {
      console.log("Previous db save is still in process, skipping.");
      return; // If already locked, skip this cycle
    }

    this.locks[board_id] = true; // Acquire lock

    try {
      const strokesToSave = this.strokes[board_id].slice();
      this.strokes[board_id] = [];

      await Drawing.updateOne(
        { board_id },
        { $push: { strokes: { $each: strokesToSave } } },
        { upsert: true }
      );

      console.log(
        `Updated DB for board_id ${board_id} with ${strokesToSave.length} strokes`
      );
    } catch (dbError) {
      console.error(`Error updating DB for board_id ${board_id}:`, dbError);
      // Re-add unsaved strokes back to the queue for retry
      this.strokes[board_id] = strokesToSave.concat(this.strokes[board_id]);
    } finally {
      this.locks[board_id] = false; // Release lock
    }
  }
}

module.exports = DrawingService;
