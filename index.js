const dotenv = require('dotenv');
dotenv.config();

require('./database');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const cors = require('cors');
const { userRouter } = require('./routers/user');

const io = require('socket.io')(http, {
    cors: {
        origin: true
    }
});

app.use(express.urlencoded({extended: true}))
app.use(bodyParser.json({type: 'application/json'}));
app.use(cors({ credentials: true, origin: true }));
app.use('/user', userRouter);

io.on('connection', (socket) => {
    socket.on('chat message', (message) => {
        socket.broadcast.emit('receive message', message);
      });
});

http.listen(process.env.PORT, () => {
    console.log(`On port ${process.env.PORT}`)
})
