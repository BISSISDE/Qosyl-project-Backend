const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { PORT } = require("./config/env");
const { authMiddleware, errorHandler, limiter } = require("./middleware/auth");
const authRoutes = require("./routes/authRoutes");
const profileRouter = require("./routes/profile");
const inviteRoutes = require("./routes/create");
const goalRoutes = require("./routes/goal");
const taskRoutes = require("./routes/task");
const app = express();
app.use(express.json());
app.use(helmet());
app.use("/api", limiter);
const path = require("path");
app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", [
    "http://localhost:5176",
    "https://qosyl-project-frontend.vercel.app/",
  ]);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.set("trust proxy", 1);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: [
      "http://localhost:5176",
      "https://qosyl-project-frontend.vercel.app",
    ],
    credentials: true,
  })
);
app.use("/api", profileRouter);
app.use("/api/auth", authRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/api/goal", goalRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/secure", authMiddleware, (req, res) => {
  res.send("secure data");
});
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
