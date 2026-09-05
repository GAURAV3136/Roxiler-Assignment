const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

const register = async (req, res) => {
  try {
    const { name, email, address, password } = req.body;

    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanAddress = address?.trim();

    if (!cleanName || !cleanEmail || !cleanAddress || !password) {
      return res.status(400).json({
        message: "Name, email, address, and password are required"
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
      [cleanName, cleanEmail, passwordHash, cleanAddress, "USER"]
    );

    return res.status(201).json({
      message: "Normal user registered successfully",
      user: {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
        address: cleanAddress,
        role: "USER"
      }
    });
  } catch (error) {
    console.error("Register error:", error.message);

    return res.status(500).json({
      message: "Unable to register user"
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const [users] = await pool.execute(
      `SELECT id, name, email, password_hash, address, role
       FROM users
       WHERE email = ?`,
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = users[0];

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Unable to log in"
    });
  }
};

// password change functionality for users, store owners, and admins

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required"
      });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be 8-16 characters and include at least one uppercase letter and one special character"
      });
    }

    const [users] = await pool.execute(
      "SELECT id, password_hash FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      users[0].password_hash
    );

    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        message: "Current password is incorrect"
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await pool.execute(
      `UPDATE users
       SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newPasswordHash, userId]
    );

    return res.status(200).json({
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Change password error:", error.message);

    return res.status(500).json({
      message: "Unable to update password"
    });
  }
};



module.exports = {
  register,
  login,
  changePassword
};