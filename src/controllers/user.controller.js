const pool = require("../config/db");

exports.getMe = async (req, res) => {
  const userId = req.user.userId;

  const user = await pool.query(
    `
    SELECT id, username, full_name, age, location, role
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  if (user.rows[0].role === "candidate") {
    const profile = await pool.query(
      `
      SELECT education, experience, certificates
      FROM candidate_profiles
      WHERE user_id = $1
      `,
      [userId]
    );

    return res.json({
      ...user.rows[0],
      profile: profile.rows[0],
    });
  }

  res.json(user.rows[0]);
};

exports.getAppliedJobs = async (req, res) => {
  const userId = req.user.userId;

  const result = await pool.query(
    `
    SELECT j.*
    FROM job_applications ja
    JOIN jobs j ON j.id = ja.job_id
    WHERE ja.user_id = $1
    ORDER BY ja.applied_at DESC
    `,
    [userId]
  );

  res.json({
    count: result.rowCount,
    data: result.rows,
  });
};
