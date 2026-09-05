// backend/routes/ownerRoutes.js
const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Middleware to verify JWT and attach user to req
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

// GET /api/owner/dashboard
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Get stores owned by this owner
    const [stores] = await db.query(
      "SELECT id, name, address, email, owner_id FROM stores WHERE owner_id = ?",
      [ownerId]
    );

    if (stores.length === 0) {
      return res.json({
        stores: [],
        ratingsSummary: []
      });
    }

    const storeIds = stores.map((s) => s.id);

    // Get average rating per store (optional, can be enhanced later)
    const [avgRatings] = await db.query(
      `SELECT store_id, AVG(rating) AS avg_rating
       FROM ratings
       WHERE store_id IN (?)
       GROUP BY store_id`,
      [storeIds]
    );

    // Get users who rated these stores
    const [ratingRows] = await db.query(
      `SELECT r.store_id, r.rating, u.id AS user_id, u.name AS user_name, u.email AS user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id IN (?)
       ORDER BY r.store_id`,
      [storeIds]
    );

    // Build summary per store
    const ratingsSummary = stores.map((store) => {
      const avg = avgRatings.find((x) => x.store_id === store.id);
      const storeRatings = ratingRows.filter((x) => x.store_id === store.id);

      return {
        storeId: store.id,
        storeName: store.name,
        address: store.address,
        email: store.email,
        averageRating: avg ? Number(avg.avg_rating).toFixed(2) : null,
        ratings: storeRatings.map((r) => ({
          userId: r.user_id,
          userName: r.user_name,
          userEmail: r.user_email,
          rating: r.rating
        }))
      };
    });

    res.json({ stores, ratingsSummary });
  } catch (err) {
    console.error("Owner dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;