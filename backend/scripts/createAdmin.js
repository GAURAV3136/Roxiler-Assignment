// backend/scripts/createAdmin.js
//
// One-time bootstrap script to create the first Admin account (or promote
// an existing user to Admin). Needed because the app has no self-service
// way to create an Admin: /api/auth/register always creates role=USER,
// and /api/admin/users requires you to already be logged in as an Admin.
//
// Usage (run from the backend/backend folder, where node_modules lives):
//   node scripts/createAdmin.js "Full Admin Name Here" admin@example.com "Passw0rd!" "Admin Address, City"
//
// - Name must be 20-60 characters (same rule as the rest of the app)
// - Password must be 8-16 characters with at least 1 uppercase + 1 special character
// - If the email already exists, this PROMOTES that user to ADMIN and
//   resets their password to the one you pass in.
// - If the email does not exist, this CREATES a new ADMIN user.

const bcrypt = require("bcrypt");
const pool = require("../config/db");
const {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword
} = require("../utils/validators");

const run = async () => {
  const [name, email, password, address] = process.argv.slice(2);

  if (!name || !email || !password || !address) {
    console.error(
      "Usage: node scripts/createAdmin.js \"Full Name (20-60 chars)\" email@example.com \"Passw0rd!\" \"Address\""
    );
    process.exit(1);
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanAddress = address.trim();

  const nameError = validateName(cleanName);
  if (nameError) {
    console.error("Invalid name:", nameError);
    process.exit(1);
  }

  const emailError = validateEmail(cleanEmail);
  if (emailError) {
    console.error("Invalid email:", emailError);
    process.exit(1);
  }

  const addressError = validateAddress(cleanAddress);
  if (addressError) {
    console.error("Invalid address:", addressError);
    process.exit(1);
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    console.error("Invalid password:", passwordError);
    process.exit(1);
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [cleanEmail]
    );

    if (existing.length > 0) {
      await pool.execute(
        `UPDATE users
         SET name = ?, password_hash = ?, address = ?, role = 'ADMIN', updated_at = CURRENT_TIMESTAMP
         WHERE email = ?`,
        [cleanName, passwordHash, cleanAddress, cleanEmail]
      );

      console.log(`Existing user "${cleanEmail}" promoted to ADMIN and password reset.`);
    } else {
      await pool.execute(
        `INSERT INTO users (name, email, password_hash, address, role)
         VALUES (?, ?, ?, ?, 'ADMIN')`,
        [cleanName, cleanEmail, passwordHash, cleanAddress]
      );

      console.log(`New ADMIN user "${cleanEmail}" created successfully.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Failed to create/promote admin:", error.message);
    process.exit(1);
  }
};

run();