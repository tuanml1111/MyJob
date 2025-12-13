const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

router.get("/me", auth, userController.getMe);
router.get("/me/applications", auth, userController.getAppliedJobs);

module.exports = router;
