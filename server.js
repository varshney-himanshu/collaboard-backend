const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const app = express();
const async = require("async");

const server = http.createServer(app);
const path = require("path");
const socketIO = new Server(server);

let strokes = [];

let queue = async.queue((taskData, callback) => {
  strokes.push(taskData.stroke);
  taskData.socket.broadcast.emit("write-update", taskData.stroke);

  callback();
}, 1);

/*
 * ----- socket connections ------
 */

socketIO.on("connection", (socket) => {
  console.log(`socket id:${socket.id} connected`);

  socket.emit("connect-success", { data: strokes });

  socket.on("write", ({ stroke }) => {
    queue.push({ stroke, socket }, (err) => {
      if (err) {
        console.error("Error processing queue task:", err);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log(`socket id:${socket.id} disconnected`);
  });
});

/* http server endpoints */
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;

setInterval(() => {}, 1000);

server.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`);
});
