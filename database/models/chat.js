const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatSchema = new Schema({
  
  });

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
