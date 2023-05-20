const dotenv = require('dotenv');
dotenv.config();

require('./database');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const cors = require('cors');
const { userRouter } = require('./routers/user');
const { messageRouter } = require('./routers/message.js')

const io = require('socket.io')(http, {
    cors: {
        origin: true
    }
});

app.use(express.urlencoded({extended: true}))
app.use(bodyParser.json({type: 'application/json'}));
app.use(cors({ credentials: true, origin: true }));

app.use('/user', userRouter);
app.use('/message', messageRouter)

io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("invalid username"));
    }

    socket.userId = socket.handshake.auth.userId;
    socket.username = username;
    next();
  });


global.onlineUsers = new Map();
io.on('connection', (socket) => {
    console.log(`User ${socket.handshake.auth.username} connected!`);

    global.chatSocket = socket;
    onlineUsers.set(socket.userId, socket.id);

    socket.on("private message", ({ content, from, to }) => {
        const sendUserSocket = onlineUsers.get(to);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit("receive message", from, content ); 
        }
    })
    socket.on('disconnect', (reason) => {
        console.log(`User ${socket.handshake.auth.username} disconnected`)
    })
});

function errorHandler(error, req, res, next) {
    res.header("Content-Type", "application/json");
    console.log("Error occured: ", error.message);
    res.status(500).send(error.message);
}
app.use(errorHandler)

http.listen(process.env.PORT, () => {
    console.log(`On port ${process.env.PORT}`)
})
