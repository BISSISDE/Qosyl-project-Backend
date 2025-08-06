const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const createInvite = async (req, res, next) => {
  const { goalName, durationDays } = req.body;
  const creatorId = req.user.id; 

  if (!goalName || !durationDays || !creatorId)
    return res.status(400).json({ error: "Бос жолдар" });

  try {
    const token = uuidv4();

    const result = await pool.query(
      "INSERT INTO invites (goal_name, duration_days, token, creator_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [goalName, durationDays, token, creatorId]
    );

    const invite = result.rows[0];

    await pool.query(
      "INSERT INTO goal_participants (goal_id, user_id) VALUES ($1, $2)",
      [invite.id, creatorId]
    );

    const inviteLink = `https://qosyl-project-frontend.vercel.app/invite/${token}`;
    res.json({ inviteLink, goal: invite });
  } catch (err) {
    next(err);
  }
};


const getInviteByToken = async (req, res, next) => {
  const { token } = req.params;

  try {
    const result = await pool.query("SELECT * FROM invites WHERE token = $1", [
      token,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Сілтеме табылмады" });
    }
    console.log(result.rows[0]);
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const postInviteJoin = async (req, res, next) => {
  const { token } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query("SELECT id FROM invites WHERE token = $1", [
      token,
    ]);

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Invalid token" });

    const goalId = result.rows[0].id;

    await pool.query(
      "INSERT INTO goal_participants (goal_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [goalId, userId]
    );

    res.json({ success: true, goalId });
  } catch (err) {
    console.error("JOIN DB ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};


const getMyInvites = async (req, res) => {
  try {
    console.log("USER ID:", req.user?.id); 
    const userId = req.user.id;

    const myInvites = await pool.query(
      "SELECT * FROM invites WHERE creator_id = $1",
      [userId]
    );

    res.json(myInvites.rows);
  } catch (error) {
    console.error("MY INVITES ERROR:", error);
    res.status(500).json({ message: "Мақсаттарды жүктеу қатесі" });
  }
};



module.exports = { createInvite , getInviteByToken, postInviteJoin , getMyInvites};