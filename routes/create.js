const express = require("express");
const {
  createInvite,
  getInviteByToken,
  postInviteJoin,
  getMyInvites,
} = require("../controllers/invController");

const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/friend", authMiddleware, createInvite);
router.get("/my", authMiddleware, getMyInvites);
router.post("/join", authMiddleware, postInviteJoin);
router.get("/:token", getInviteByToken);

module.exports = router;
