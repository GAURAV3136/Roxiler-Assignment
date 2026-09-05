const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

const { authenticateToken } = require("./middleware/authMiddleware");
const { authorizeRoles } = require("./middleware/roleMiddleware");

const storeRoutes = require("./routes/storeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/owner", ownerRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Store Rating API is running"
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT 1 AS databaseConnected");

    res.status(200).json({
      message: "Express and MySQL are connected successfully",
      database: rows[0]
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      message: "Could not connect to MySQL",
      error: error.message
    });
  }
});

app.get("/api/profile", authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Protected profile route accessed successfully",
    loggedInUser: req.user
  });
});

app.get(
  "/api/admin/test",
  authenticateToken,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome Admin. You can access this route."
    });
  }
);

app.get(
  "/api/user/test",
  authenticateToken,
  authorizeRoles("USER"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome Normal User. You can access this route."
    });
  }
);

// Debug route to see stores for a specific owner_id
app.get("/debug-owner-stores", async (req, res) => {
  const db = require("./config/db");

  // Replace 6 with Priya's actual user id from the users table
  const ownerId = 6;

  const [stores] = await db.query(
    "SELECT id, name, address, email, owner_id FROM stores WHERE owner_id = ?",
    [ownerId]
  );

  res.json({ ownerId, stores });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});