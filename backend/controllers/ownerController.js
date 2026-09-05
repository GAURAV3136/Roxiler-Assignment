const pool = require("../config/db");

const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const [stores] = await pool.execute(
      `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        ROUND(AVG(r.rating), 2) AS averageRating,
        COUNT(r.id) AS totalRatings
      FROM stores s
      LEFT JOIN ratings r
        ON r.store_id = s.id
      WHERE s.owner_id = ?
      GROUP BY
        s.id,
        s.name,
        s.email,
        s.address
      ORDER BY s.name ASC
      `,
      [ownerId]
    );

    return res.status(200).json({
      message: "Store Owner dashboard fetched successfully",
      stores
    });
  } catch (error) {
    console.error("Store Owner dashboard error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch Store Owner dashboard"
    });
  }
};

const getUsersWhoRatedOwnerStores = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const [ratings] = await pool.execute(
      `
      SELECT
        r.id AS ratingId,
        r.rating,
        r.created_at AS submittedAt,
        r.updated_at AS updatedAt,
        s.id AS storeId,
        s.name AS storeName,
        u.id AS userId,
        u.name AS userName,
        u.email AS userEmail,
        u.address AS userAddress
      FROM ratings r
      INNER JOIN stores s
        ON s.id = r.store_id
      INNER JOIN users u
        ON u.id = r.user_id
      WHERE s.owner_id = ?
      ORDER BY r.updated_at DESC
      `,
      [ownerId]
    );

    return res.status(200).json({
      message: "Users who rated your stores fetched successfully",
      ratings
    });
  } catch (error) {
    console.error("Get users who rated stores error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch users who rated your stores"
    });
  }
};

module.exports = {
  getOwnerDashboard,
  getUsersWhoRatedOwnerStores
};