const mysql = require("mysql2");

let db;

if (process.env.RENDER) {
  console.log("Running on Render – skipping MySQL connection");
  db = {
    query: (sql, params, cb) => cb(null, [])
  };
} else {
  db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "vehicle_rental"
  });

  db.connect(err => {
    if (err) console.error("MySQL error:", err.message);
    else console.log("MySQL connected");
  });
}

module.exports = db;
