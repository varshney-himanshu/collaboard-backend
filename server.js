const express = require("express");
const http = require("http");
const app = express();

const server = http.createServer(app);
const passport = require("passport");
const cors = require("cors");
const DrawingService = require("./drawing-service");
const Database = require("./database");
const path = require("path");

require("dotenv").config();

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(cors());

app.use(passport.initialize());
require("./config/passport")(passport);

// Database connection
const db = new Database();
db.start();

// Drawing Service
new DrawingService(server);

// routes
const authRoute = require("./routes/auth.route");
const boardRoute = require("./routes/board.route");

app.use("/auth", authRoute);
app.use("/board", boardRoute);

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname + "/public/index.html"));
});

const PORT = process.env.PORT || 5000;

setInterval(() => {}, 1000);

server.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`);
});
