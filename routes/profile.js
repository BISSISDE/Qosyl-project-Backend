const express = require("express");
const { upload } = require("../middleware/upload");
const { authMiddleware } = require("../middleware/auth");
const pool = require("../config/db");

const router = express.Router();

router.post(
  "/profile/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    const avatar = req.file ? req.file.filename : null;

    if (!avatar) return res.status(400).json({ message: "Avatar is required" });

    const userId = req.user.id;

    try {
      await pool.query("UPDATE users SET avatar = $1 WHERE id = $2", [
        avatar,
        userId,
      ]);
      res.status(201).json({ message: "Avatar added successfully", avatar });
    } catch (err) {
      res.status(500).json({ error: "DB error" });
    }
  }
);

module.exports = router;
