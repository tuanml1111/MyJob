const pool = require("../config/db");

exports.getAllJobs = async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM jobs
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
};

exports.searchJobs = async (req, res) => {
  try {
    const {
      q,
      skill,
      location,
      job_type,
      min_salary,
      max_salary,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (page - 1) * limit;

    let conditions = ["active_flag = TRUE"];
    let values = [];
    let idx = 1;

    // Search title + description
    if (q) {
      conditions.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
      values.push(`%${q}%`);
      idx++;
    }

    // Filter skill (TEXT[])
    if (skill) {
      conditions.push(`skills @> ARRAY[$${idx}]`);
      values.push(skill);
      idx++;
    }

    // Location
    if (location) {
      conditions.push(`location ILIKE $${idx}`);
      values.push(`%${location}%`);
      idx++;
    }

    // Job type
    if (job_type) {
      conditions.push(`job_type = $${idx}`);
      values.push(job_type);
      idx++;
    }

    // Salary range
    if (min_salary) {
      conditions.push(`salary_max >= $${idx}`);
      values.push(min_salary);
      idx++;
    }

    if (max_salary) {
      conditions.push(`salary_min <= $${idx}`);
      values.push(max_salary);
      idx++;
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const query = `
      SELECT *
      FROM jobs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    values.push(limit, offset);

    const result = await pool.query(query, values);

    res.json({
      meta: {
        page: Number(page),
        limit: Number(limit),
        count: result.rowCount,
      },
      data: result.rows,
    });
  } catch (error) {
    console.error("Search jobs error:", error);
    res.status(500).json({
      message: "Failed to search jobs",
    });
  }
};

exports.applyJob = async (req, res) => {
  const userId = req.user.userId;
  const jobId = req.params.id;

  await pool.query(
    `
    INSERT INTO job_applications (user_id, job_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    `,
    [userId, jobId]
  );

  res.json({ message: "Applied successfully" });
};
