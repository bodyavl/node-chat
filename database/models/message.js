const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
    value: String,
    username: String
})

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;