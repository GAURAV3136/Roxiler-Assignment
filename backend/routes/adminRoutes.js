const express = require("express");

const {
  getDashboardStats,
  createUser,
  createStore,
  getUsers,
  getUserById,
  getStores
} = require("../controllers/adminController");

const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getDashboardStats
);

router.post(
  "/users",
  authenticateToken,
  authorizeRoles("ADMIN"),
  createUser
);

router.get(
  "/users",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getUsers
);

router.get(
  "/users/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getUserById
);

router.post(
  "/stores",
  authenticateToken,
  authorizeRoles("ADMIN"),
  createStore
);

router.get(
  "/stores",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getStores
);

module.exports = router;