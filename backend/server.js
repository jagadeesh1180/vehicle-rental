const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

/**
 * Serve frontend files from ROOT directory
 * (because frontend was moved to root)
 */
app.use(express.static(path.join(__dirname, "..")));

/**
 * Default route → index.html
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

/**
 * API routes
 */
const routes = require("./routes");
app.use(routes);

/**
 * Start server (Render requires process.env.PORT)
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
