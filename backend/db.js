const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1629215",        // your DB password
  database: "vehicle_rental"
});

db.connect((err) => {
  if (err) throw err;
  console.log("Database connected");
});

module.exports = db;
