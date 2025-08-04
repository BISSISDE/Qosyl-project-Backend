const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");

exports.register = async (req, res, next) => {
  const { username, password, email } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users(username, password, email, registered) VALUES($1, $2, $3, NOW()) RETURNING *",
      [username, hashedPassword, email]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        registered: user.registered,
      },
    });
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "Username немесе email бұрын тіркелген" });
    }
    console.log(err);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users where username = $1", [
      username,
    ]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send("user undefined or password wrong");
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" });
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        registered: user.registered,
      },
    });
  } catch (err) {
    next(err);
  }
};
