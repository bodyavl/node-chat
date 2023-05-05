const mongoose = require("mongoose");
const { Schema } = mongoose;


const messageSchema = new Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const chatSchema = new Schema({
    messages: [messageSchema],
    users: Array,
  });

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
