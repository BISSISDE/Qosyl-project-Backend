const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const { authMiddleware } = require("../middleware/auth");
router.post("/", authMiddleware, async (req, res) => {
  const { goalName, duration } = req.body;
  const userId = req.user?.id;

  if (!goalName || !duration || !userId) {
    return res.status(400).json({ error: "Барлық мәліметтер қажет" });
  }

  const token = uuidv4();

  try {
    const insertRes = await pool.query(
      "INSERT INTO invites (goal_name, duration_days, token) VALUES ($1, $2, $3) RETURNING id",
      [goalName, duration, token]
    );
    const goalId = insertRes.rows[0].id;

    await pool.query(
      "INSERT INTO goal_participants (goal_id, user_id) VALUES ($1, $2)",
      [goalId, userId]
    );

    const link = `http://localhost:3000/invite/${token}`;
    res.json({ link });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Сервер қатесі", details: err.message });
  }
});
router.get("/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const result = await pool.query(
      "SELECT goal_name, duration_days FROM invites WHERE token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Токен табылмады" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB қатесі:", err);
    res.status(500).json({ error: "Сервер қатесі" });
  }
});

router.post("/join", authMiddleware, async (req, res) => {
  const { token } = req.body;
  const userId = req.user?.id;

  if (!token || !userId) {
    return res.status(400).json({ error: "Токен мен қолданушы ID қажет" });
  }

  try {
    const goalResult = await pool.query(
      "SELECT id FROM invites WHERE token = $1",
      [token]
    );

    if (goalResult.rows.length === 0) {
      return res.status(404).json({ error: "Мақсат табылмады" });
    }

    const goalId = goalResult.rows[0].id;

    await pool.query(
      "INSERT INTO goal_participants (user_id, goal_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, goalId]
    );

    res.json({ goal_id: goalId });
  } catch (err) {
    console.error("Қате:", err);
    res.status(500).json({ error: "Сервер қатесі", details: err.message });
  }
});

router.post("/:token/accept", authMiddleware, async (req, res) => {
  const { token } = req.params;
  const userId = req.user.id;

  try {
    const inviteRes = await pool.query(
      "SELECT * FROM invites WHERE token = $1 AND status = 'pending'",
      [token]
    );

    if (inviteRes.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Шақыру табылмады немесе жарамсыз" });
    }

    const invite = inviteRes.rows[0];

    const existing = await pool.query(
      "SELECT * FROM goal_participants WHERE goal_id = $1 AND user_id = $2",
      [invite.goal_id, userId]
    );

    if (existing.rowCount > 0) {
      return res
        .status(400)
        .json({ message: "Сіз бұл мақсатқа бұрын қосылғансыз" });
    }

    await pool.query(
      "INSERT INTO goal_participants (goal_id, user_id) VALUES ($1, $2)",
      [invite.goal_id, userId]
    );

    await pool.query("UPDATE invites SET status = 'accepted' WHERE id = $1", [
      invite.id,
    ]);

    res.json({ message: "Сәтті қосылдыңыз", goalId: invite.goal_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
});

module.exports = router;
