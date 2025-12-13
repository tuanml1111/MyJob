const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { validatePassword } = require("../utils/password");

exports.register = async (req, res) => {
  const { username, password, full_name, age, location } = req.body;

  if (!validatePassword(password)) {
    return res.status(400).json({
      message: "Password must be >=8 chars, include upper, lower and number",
    });
  }

  const hash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users (username, password_hash, full_name, age, location)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING id, username, role
    `,
    [username, hash, full_name, age, location]
  );

  // tạo profile cho candidate
  await pool.query(`INSERT INTO candidate_profiles (user_id) VALUES ($1)`, [
    result.rows[0].id,
  ]);

  res.status(201).json({
    message: "User registered",
    user: result.rows[0],
  });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const result = await pool.query(`SELECT * FROM users WHERE username = $1`, [
    username,
  ]);

  if (result.rowCount === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password_hash);

  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  });
};
