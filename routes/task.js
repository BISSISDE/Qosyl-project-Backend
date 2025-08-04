const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const {
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} = require("../controllers/TaskController");

router.post("/:id", authMiddleware, createTask);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);
router.put("/status/:taskId", authMiddleware, updateTaskStatus);

module.exports = router;
