const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const router = express.Router();
const Message = require("../database/models/message");
const { authToken } = require("../routers/user");

router.get("/", authToken, async (req, res, next) => {
  try {
    const { from, to } = req.query
    const messages = await Message.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });
    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        content: msg.message.text,
      };
    });
    res.json(projectedMessages);
  } catch (error) {
    next(error);
  }
});

router.post("/add", authToken, async (req, res, next) => {
  try {
    const { from, to, content } = req.body;
    const data = await Message.create({
      message: { text: content },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (error) {
    next(error);
  }
});

module.exports = { messageRouter: router };
