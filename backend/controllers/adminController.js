const bcrypt = require("bcrypt");
const pool = require("../config/db");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

const getDashboardStats = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM users) AS totalUsers,
        (SELECT COUNT(*) FROM stores) AS totalStores,
        (SELECT COUNT(*) FROM ratings) AS totalRatings
    `);

    return res.status(200).json({
      message: "Admin dashboard statistics fetched successfully",
      stats: rows[0]
    });
  } catch (error) {
    console.error("Admin dashboard error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch dashboard statistics"
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanAddress = address?.trim();
    const cleanRole = role?.trim().toUpperCase();

    const allowedRoles = ["ADMIN", "USER", "OWNER"];

    if (!cleanName || !cleanEmail || !cleanAddress || !password || !cleanRole) {
      return res.status(400).json({
        message: "Name, email, address, password, and role are required"
      });
    }

    if (cleanName.length < 20 || cleanName.length > 60) {
      return res.status(400).json({
        message: "Name must be between 20 and 60 characters"
      });
    }

    if (cleanAddress.length > 400) {
      return res.status(400).json({
        message: "Address must not exceed 400 characters"
      });
    }

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Enter a valid email address"
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters and include at least one uppercase letter and one special character"
      });
    }

    if (!allowedRoles.includes(cleanRole)) {
      return res.status(400).json({
        message: "Role must be ADMIN, USER, or OWNER"
      });
    }

    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "A user with this email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES (?, ?, ?, ?, ?)`,
      [cleanName, cleanEmail, passwordHash, cleanAddress, cleanRole]
    );

    return res.status(201).json({
      message: `${cleanRole} user created successfully`,
      user: {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
        address: cleanAddress,
        role: cleanRole
      }
    });
  } catch (error) {
    console.error("Create user error:", error.message);

    return res.status(500).json({
      message: "Unable to create user"
    });
  }
};

const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanAddress = address?.trim();
    const cleanOwnerId = Number(ownerId);

    if (!cleanName || !cleanEmail || !cleanAddress || !ownerId) {
      return res.status(400).json({
        message: "Store name, email, address, and ownerId are required"
      });
    }

    if (cleanName.length > 100) {
      return res.status(400).json({
        message: "Store name must not exceed 100 characters"
      });
    }

    if (cleanAddress.length > 400) {
      return res.status(400).json({
        message: "Address must not exceed 400 characters"
      });
    }

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Enter a valid store email address"
      });
    }

    if (!Number.isInteger(cleanOwnerId) || cleanOwnerId <= 0) {
      return res.status(400).json({
        message: "ownerId must be a valid positive integer"
      });
    }

    const [existingStores] = await pool.execute(
      "SELECT id FROM stores WHERE email = ?",
      [cleanEmail]
    );

    if (existingStores.length > 0) {
      return res.status(409).json({
        message: "A store with this email already exists"
      });
    }

    const [owners] = await pool.execute(
      "SELECT id, name, email, role FROM users WHERE id = ? AND role = 'OWNER'",
      [cleanOwnerId]
    );

    if (owners.length === 0) {
      return res.status(400).json({
        message: "The provided ownerId does not belong to a Store Owner"
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES (?, ?, ?, ?)`,
      [cleanName, cleanEmail, cleanAddress, cleanOwnerId]
    );

    return res.status(201).json({
      message: "Store created successfully",
      store: {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
        address: cleanAddress,
        owner: owners[0]
      }
    });
  } catch (error) {
    console.error("Create store error:", error.message);

    return res.status(500).json({
      message: "Unable to create store"
    });
  }
};


const getUsers = async (req, res) => {
  try {
    const name = req.query.name?.trim() || "";
    const email = req.query.email?.trim() || "";
    const address = req.query.address?.trim() || "";
    const role = req.query.role?.trim().toUpperCase() || "";

    const allowedSortFields = ["name", "email", "address", "role", "created_at"];
    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : "name";

    const sortOrder =
      req.query.sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const [users] = await pool.execute(
      `
      SELECT
        id,
        name,
        email,
        address,
        role,
        created_at
      FROM users
      WHERE name LIKE ?
        AND email LIKE ?
        AND address LIKE ?
        AND role LIKE ?
      ORDER BY ${sortBy} ${sortOrder}
      `,
      [
        `%${name}%`,
        `%${email}%`,
        `%${address}%`,
        `%${role}%`
      ]
    );

    return res.status(200).json({
      message: "Users fetched successfully",
      filters: {
        name,
        email,
        address,
        role,
        sortBy,
        sortOrder
      },
      users
    });
  } catch (error) {
    console.error("Get users error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch users"
    });
  }
};

const getStores = async (req, res) => {
  try {
    const name = req.query.name?.trim() || "";
    const email = req.query.email?.trim() || "";
    const address = req.query.address?.trim() || "";

    const allowedSortFields = ["name", "email", "address", "overallRating"];
    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : "name";

    const sortOrder =
      req.query.sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const [stores] = await pool.execute(
      `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id AS ownerId,
        u.name AS ownerName,
        ROUND(AVG(r.rating), 2) AS overallRating,
        COUNT(r.id) AS totalRatings
      FROM stores s
      LEFT JOIN users u
        ON u.id = s.owner_id
      LEFT JOIN ratings r
        ON r.store_id = s.id
      WHERE s.name LIKE ?
        AND s.email LIKE ?
        AND s.address LIKE ?
      GROUP BY
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        u.name
      ORDER BY ${sortBy} ${sortOrder}
      `,
      [
        `%${name}%`,
        `%${email}%`,
        `%${address}%`
      ]
    );

    return res.status(200).json({
      message: "Stores fetched successfully",
      filters: {
        name,
        email,
        address,
        sortBy,
        sortOrder
      },
      stores
    });
  } catch (error) {
    console.error("Get stores error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch stores"
    });
  }
};


// Additional function to get user details by ID
const getUserById = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "User ID must be a valid positive integer"
      });
    }

    const [users] = await pool.execute(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        u.created_at,
        u.updated_at,
        GROUP_CONCAT(
          DISTINCT CONCAT(
            s.name,
            " (Average Rating: ",
            COALESCE(ROUND(store_ratings.averageRating, 2), "No ratings"),
            ")"
          )
          SEPARATOR " | "
        ) AS ownedStores
      FROM users u
      LEFT JOIN stores s
        ON s.owner_id = u.id
      LEFT JOIN (
        SELECT
          store_id,
          AVG(rating) AS averageRating
        FROM ratings
        GROUP BY store_id
      ) store_ratings
        ON store_ratings.store_id = s.id
      WHERE u.id = ?
      GROUP BY
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        u.created_at,
        u.updated_at
      `,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      message: "User details fetched successfully",
      user: users[0]
    });
  } catch (error) {
    console.error("Get user details error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch user details"
    });
  }
};


module.exports = {
  getDashboardStats,
  createUser,
  createStore,
  getUsers,
  getUserById,
  getStores
};