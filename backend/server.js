const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend (HTML, JS)
app.use(express.static(path.join(__dirname, "frontend")));

// API routes
app.use("/", routes);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
const path = require("path");

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});
