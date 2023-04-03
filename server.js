/* eslint-disable no-unused-vars */
const http= require('http');
const express = require('express');
const path = require('path');
const app = express();
const {Server} = require('socket.io');
const ACTIONS = require('./src/Actions');


const server = http.createServer(app);
const io = new Server(server);


app.use(express.static('build'));
app.use((req,res,next) => {
    res.sendFile(path.join(__dirname,'build','index.html'))
});

const userSocketMap = {};

const getAllConnectedClients=(roomId)=>{
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId)=> {
        return {
            socketId,
            userName: userSocketMap[socketId]
        }
    });
}

io.on('connection',(socket)=>{
    console.log('socket connected ',socket.id);

    socket.on(ACTIONS.JOIN,({roomId,userName})=>{
        userSocketMap[socket.id]=userName;
        socket.join(roomId);

        const clients = getAllConnectedClients(roomId);
        clients.forEach(({socketId})=>{
            io.to(socketId).emit(ACTIONS.JOINED,{
                clients,
                userName,
                socketId:socket.id,
            });
        });

    });

    socket.on('disconnecting',()=>{
        const rooms = [...socket.rooms];
        rooms.forEach((roomId)=>{
            socket.in(roomId).emit(ACTIONS.DISCONNECTED,{
                socketId:socket.id,
                userName: userSocketMap[socket.id]
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });


    socket.on(ACTIONS.CODE_CHANGE,({roomId,code})=>{
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE,{
            code
        });
    })

    socket.on(ACTIONS.SYNC_CODE,({socketId,code})=>{
        io.to(socketId).emit(ACTIONS.CODE_CHANGE,{
            code
        });
    })

});


const PORT = process.env.PORT || 5000;
server.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`);
})
