const pool = require("../config/db");

const getGoalData = async (req, res, next) => {
  const goalId = req.params.id;
  const userId = req.user.id;

  try {
    const participantCheck = await pool.query(
      "SELECT * FROM goal_participants WHERE goal_id = $1 AND user_id = $2",
      [goalId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({
        error: "Сіз бұл мақсатқа қатыспайсыз.",
      });
    }

    const goalRes = await pool.query("SELECT * FROM invites WHERE id = $1", [
      goalId,
    ]);

    const tasksRes = await pool.query(
      "SELECT * FROM tasks WHERE goal_id = $1",
      [goalId]
    );

    const statusRes = await pool.query(
      `SELECT * FROM task_status WHERE task_id IN (SELECT id FROM tasks WHERE goal_id = $1)`,
      [goalId]
    );

    const participantsRes = await pool.query(
      `
      SELECT u.id, u.username
      FROM goal_participants gp
      JOIN users u ON gp.user_id = u.id
      WHERE gp.goal_id = $1
      `,
      [goalId]
    );

    const participants = participantsRes.rows;

    res.json({
      goal: goalRes.rows[0],
      tasks: tasksRes.rows,
      statuses: statusRes.rows,
      participants,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getGoalData,
};
