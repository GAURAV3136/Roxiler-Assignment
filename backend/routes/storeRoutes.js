const express = require("express");

const {
  getAllStoresForUser,
  submitOrUpdateRating
} = require("../controllers/storeController");

const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("USER"),
  getAllStoresForUser
);

router.post(
  "/:storeId/rating",
  authenticateToken,
  authorizeRoles("USER"),
  submitOrUpdateRating
);

router.put(
  "/:storeId/rating",
  authenticateToken,
  authorizeRoles("USER"),
  submitOrUpdateRating
);

module.exports = router;