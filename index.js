const dotenv = require('dotenv');
dotenv.config();

require('./database');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
app.use(cors({ credentials: true, origin: true }));
const io = require('socket.io')(http, {
    cors: {
        origin: true
    }
});
const Message = require('./database/models/message');

io.on('connection', (socket) => {
    socket.on('chat message', (message) => {
        const {text, username} = message;
        Message.create({text, username});
        socket.broadcast.emit('receive message', message);
      });
});
app.get('/api/messages', (req, res) => {
    const messages = Message.find({});
    if(!messages) res.sendStatus(404);
    res.json(messages);
})

http.listen(process.env.PORT, () => {
    console.log(`On port ${process.env.PORT}`)
})
