const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const { getGoalData } = require("../controllers/GoalController");

router.get("/:id", authMiddleware, getGoalData);

module.exports = router;
