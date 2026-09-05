const pool = require("../config/db");

const getAllStoresForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const search = req.query.search?.trim() || "";
    const searchValue = `%${search}%`;

    const allowedSortColumns = {
      name: "s.name",
      address: "s.address",
      overallRating: "overallRating"
    };

    const sortBy = allowedSortColumns[req.query.sortBy]
      ? req.query.sortBy
      : "name";

    const sortColumn = allowedSortColumns[sortBy];

    const sortOrder =
      req.query.sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const [stores] = await pool.execute(
      `
      SELECT
        s.id,
        s.name,
        s.address,
        ROUND(AVG(all_ratings.rating), 2) AS overallRating,
        user_rating.rating AS userRating,
        COUNT(all_ratings.id) AS totalRatings
      FROM stores s
      LEFT JOIN ratings all_ratings
        ON all_ratings.store_id = s.id
      LEFT JOIN ratings user_rating
        ON user_rating.store_id = s.id
        AND user_rating.user_id = ?
      WHERE s.name LIKE ?
        OR s.address LIKE ?
      GROUP BY
        s.id,
        s.name,
        s.address,
        user_rating.rating
      ORDER BY ${sortColumn} ${sortOrder}
      `,
      [userId, searchValue, searchValue]
    );

    return res.status(200).json({
      message: "Stores fetched successfully",
      stores
    });
  } catch (error) {
    console.error("Get stores for user error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch stores"
    });
  }
};

const submitOrUpdateRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const storeId = Number(req.params.storeId);
    const rating = Number(req.body.rating);

    if (!Number.isInteger(storeId) || storeId <= 0) {
      return res.status(400).json({
        message: "Store ID must be a valid positive integer"
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be a whole number between 1 and 5"
      });
    }

    const [stores] = await pool.execute(
      "SELECT id FROM stores WHERE id = ?",
      [storeId]
    );

    if (stores.length === 0) {
      return res.status(404).json({
        message: "Store not found"
      });
    }

    const [existingRatings] = await pool.execute(
      "SELECT id FROM ratings WHERE user_id = ? AND store_id = ?",
      [userId, storeId]
    );

    if (existingRatings.length === 0) {
      const [result] = await pool.execute(
        `INSERT INTO ratings (user_id, store_id, rating)
         VALUES (?, ?, ?)`,
        [userId, storeId, rating]
      );

      return res.status(201).json({
        message: "Rating submitted successfully",
        rating: {
          id: result.insertId,
          storeId,
          userId,
          rating
        }
      });
    }

    await pool.execute(
      `UPDATE ratings
       SET rating = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND store_id = ?`,
      [rating, userId, storeId]
    );

    return res.status(200).json({
      message: "Rating updated successfully",
      rating: {
        id: existingRatings[0].id,
        storeId,
        userId,
        rating
      }
    });
  } catch (error) {
    console.error("Submit/update rating error:", error.message);

    return res.status(500).json({
      message: "Unable to submit or update rating"
    });
  }
};


module.exports = {
  getAllStoresForUser,
  submitOrUpdateRating
};