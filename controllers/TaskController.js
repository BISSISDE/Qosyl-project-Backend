const pool = require("../config/db");

const createTask = async (req, res, next) => {
  const goalId = req.params.id;
  const { title } = req.body;
  try {
    const newTask = await pool.query(
      "INSERT INTO tasks (goal_id, title) VALUES ($1, $2) RETURNING *",
      [goalId, title]
    );
    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  const taskId = req.params.id;
  const { title } = req.body;
  try {
    const updated = await pool.query(
      "UPDATE tasks SET title = $1 WHERE id = $2 RETURNING *",
      [title, taskId]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  const taskId = req.params.id;
  try {
    await pool.query("DELETE FROM tasks WHERE id = $1", [taskId]);
    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};

const updateTaskStatus = async (req, res, next) => {
  const taskId = req.params.taskId;
  const userId = req.user.id; 
  const { day, status } = req.body;

  console.log("Received data:", { taskId, userId, day, status }); 

  try {
    const exists = await pool.query(
      "SELECT * FROM task_status WHERE task_id = $1 AND user_id = $2 AND day = $3",
      [taskId, userId, day]
    );

    if (exists.rows.length > 0) {
      const updated = await pool.query(
        "UPDATE task_status SET status = $1 WHERE task_id = $2 AND user_id = $3 AND day::date = $4::date RETURNING *",
        [status, taskId, userId, day]
      );

      res.json(updated.rows[0]);
    } else {
      const inserted = await pool.query(
        "INSERT INTO task_status (task_id, user_id, day, status) VALUES ($1, $2, $3, $4) RETURNING *",
        [taskId, userId, day, status]
      );
      res.status(201).json(inserted.rows[0]);
    }
    console.log("Req.user:", req.user);
  } catch (err) {
    console.error("Database error:", err); 
    next(err);
  }
};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
};
