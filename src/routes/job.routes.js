const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const jobController = require("../controllers/job.controller");

router.get("/", jobController.getAllJobs);
router.get("/search", jobController.searchJobs);

router.post("/:id/apply", auth, jobController.applyJob);

module.exports = router;
