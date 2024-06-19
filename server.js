const express = require("express");
const http = require("http");
const app = express();

const server = http.createServer(app);

const cors = require("cors");
const DrawingService = require("./drawing-service");
const Database = require("./database");

require("dotenv").config();

app.use(express.json());
app.use(cors());

// Database connection
const db = new Database();
db.start();

// Drawing Service
new DrawingService(server);

// routes
const authRoute = require("./routes/auth.route");
app.use("/auth", authRoute);

app.get("/", (req, res) => {
  res.send("<h1>Collaboard Backend API</h1>");
});

const PORT = process.env.PORT || 5000;

setInterval(() => {}, 1000);

server.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`);
});
