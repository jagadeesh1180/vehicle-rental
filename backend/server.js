const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
const routes = require("./routes");
app.use(routes);

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start server (Render uses process.env.PORT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
