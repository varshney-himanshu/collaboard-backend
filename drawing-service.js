const { Server } = require("socket.io");

const async = require("async");

class DrawingService {
  constructor(backendServer) {
    try {
      this.io = new Server(backendServer);

      /** MARK: strokes
       *  TODO: ADD support for storing strokes for different boards
       */
      this.strokes = [];
      this.queue = this.createQueue();

      this.io.on("connection", (socket) => {
        console.log(`socket id:${socket.id} connected`);

        socket.emit("connect-success", { data: this.strokes });

        socket.on("write", ({ stroke }) => {
          this.handleOnWriteStroke(stroke, socket);
        });

        socket.on("disconnect", () => {
          console.log(`socket id:${socket.id} disconnected`);
        });
      });
    } catch (e) {
      console.error("Could not create socket server - ", e);
    }
  }

  createQueue() {
    return async.queue((taskData, callback) => {
      this.strokes.push(taskData.stroke);
      taskData.socket.broadcast.emit("write-update", taskData.stroke);
      callback();
    }, 1);
  }

  handleOnWriteStroke = (stroke, socket) => {
    this.queue.push({ stroke, socket }, (err) => {
      if (err) {
        console.error("Error processing queue task:", err);
      }
    });
  };
}

module.exports = DrawingService;
