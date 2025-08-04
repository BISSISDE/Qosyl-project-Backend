const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");
const rateLimit = require("express-rate-limit");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token жоқ" });

  const token = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(token, JWT_SECRET);
    console.log("Authh", user);
    req.user = user;
    next();
  } catch {
    res.status(403).json({ message: "Token жарамсыз" });
  }
}
const errorHandler = (err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send("SOMETHING WENT WRONG");
};

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 500,
  message: "Too many requests",
  statusCode: 429,
});

module.exports = {
  authMiddleware,
  errorHandler,
  limiter,
};
