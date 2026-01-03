const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// API routes only
const routes = require("./routes");
app.use(routes);

// Health check
app.get("/", (req, res) => {
  res.send("Vehicle Rental Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
