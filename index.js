const dotenv = require('dotenv');
dotenv.config();

require('./database');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
const router = require('./routers/user');

const io = require('socket.io')(http, {
    cors: {
        origin: true
    }
});
const Message = require('./database/models/message');

app.use(cors({ credentials: true, origin: true }));
app.use('/user', router);

io.on('connection', (socket) => {
    socket.on('chat message', (message) => {
        socket.broadcast.emit('receive message', message);
      });
});

http.listen(process.env.PORT, () => {
    console.log(`On port ${process.env.PORT}`)
})
