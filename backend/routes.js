const express = require("express");
const router = express.Router();
const db = require("./db");
const razorpay = require("./razorpay");

/* ===============================
   TEST ROUTE
================================ */
router.get("/test", (req, res) => {
  res.send("Routes are working");
});

/* ===============================
   VEHICLES
================================ */

// Get all vehicles (User + Admin)
router.get("/vehicles", (req, res) => {
  const sql = "SELECT id, name, price FROM vehicles";

  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Add new vehicle (Admin)
router.post("/admin/vehicle", (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Name and price required" });
  }

  const sql = "INSERT INTO vehicles (name, price) VALUES (?, ?)";

  db.query(sql, [name, price], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true, message: "Vehicle added successfully" });
    }
  });
});

/* ===============================
   BOOKINGS
================================ */

// Create booking (User)
router.post("/book", (req, res) => {
  const { name, vehicle, hours, user_phone } = req.body;

  if (!name || !vehicle || !hours || !user_phone) {
    return res.status(400).json({ error: "Missing booking details" });
  }

  const sqlPrice = "SELECT price FROM vehicles WHERE name = ?";

  db.query(sqlPrice, [vehicle], (err, rows) => {
    if (err || rows.length === 0) {
      return res.status(500).json({ error: "Vehicle not found" });
    }

    const rate = rows[0].price;
    const total = rate * hours;

    const sql =
      "INSERT INTO bookings (name, vehicle, hours, total, user_phone) VALUES (?,?,?,?,?)";

    db.query(sql, [name, vehicle, hours, total, user_phone], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true, total });
      }
    });
  });
});

// Get all bookings (Admin)
router.get("/admin/bookings", (req, res) => {
  const sql = "SELECT * FROM bookings ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Get all bookings (Dashboard)
router.get("/bookings", (req, res) => {
  db.query("SELECT * FROM bookings ORDER BY id DESC", (err, rows) => {
    if (err) res.status(500).json(err);
    else res.json(rows);
  });
});

/* ===============================
   ADMIN AUTH
================================ */

router.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM admin WHERE username=? AND password=?";

  db.query(sql, [username, password], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });
});

/* ===============================
   USER OTP AUTH (DEMO BACKEND)
   (Firebase OTP handled on frontend)
================================ */

// Send OTP (demo fallback)
router.post("/user/send-otp", (req, res) => {
  const { phone } = req.body;

  const otp = "1234"; // demo only

  req.app.locals.otp = otp;
  req.app.locals.phone = phone;

  res.json({ success: true, message: "OTP sent (demo)" });
});

// Verify OTP (demo fallback)
router.post("/user/verify-otp", (req, res) => {
  const { otp } = req.body;

  if (otp === req.app.locals.otp) {
    res.json({
      success: true,
      user: { phone: req.app.locals.phone }
    });
  } else {
    res.json({ success: false });
  }
});

/* ===============================
   PAYMENTS (RAZORPAY)
================================ */

router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // paise
    currency: "INR",
    receipt: "receipt_" + Date.now()
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   EXPORT ROUTER (VERY IMPORTANT)
================================ */

module.exports = router;
// ===============================
// USER OTP (NO FIREBASE, NO CAPTCHA)
// ===============================

router.post("/user/send-otp", (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Phone number required" });
  }

  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Save OTP with expiry (2 minutes)
  req.app.locals.otpData = {
    phone,
    otp,
    expiresAt: Date.now() + 2 * 60 * 1000 // 2 minutes
  };

  console.log("OTP for testing:", otp); // 👈 visible in terminal

  res.json({
    success: true,
    message: "OTP sent",
    expiresIn: 120
  });
});

router.post("/user/verify-otp", (req, res) => {
  const { otp } = req.body;
  const otpData = req.app.locals.otpData;

  if (!otpData) {
    return res.json({ success: false, error: "No OTP generated" });
  }

  if (Date.now() > otpData.expiresAt) {
    return res.json({ success: false, error: "OTP expired" });
  }

  if (otp === otpData.otp) {
    res.json({
      success: true,
      user: { phone: otpData.phone }
    });
  } else {
    res.json({ success: false, error: "Invalid OTP" });
  }
});
// Delete vehicle (Admin)
router.delete("/admin/vehicle/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM vehicles WHERE id = ?", [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

