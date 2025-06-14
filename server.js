const path = require('path');
const http = require('http')
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./util/messages')
const { userJoin, getCurrentUser,userLeave,getRoomUsers } = require('./util/users');
const { Socket } = require('dgram');

const app = express();
const server = http.createServer(app)
const io = socketio(server)
//set static folder
app.use(express.static(path.join(__dirname,'public')))

const botName = 'chatBot'

//run when the client connect
io.on('connection',socket=>{
    socket.on('joinRoom',({username,room})=>{
        const user = userJoin(socket.id,username,room)
       
        socket.join(user.room)


    //Welcome current user
    socket.emit('message',formatMessage(botName,'Welcome to ChatBOT!!'))

    //Broadcast when a user connects
    socket.broadcast
    .to(user.room)
    .emit(
        'message',
        formatMessage(botName,`${user.username} has been connected in the chat`));

        //send users and room info
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        })
    })
  
    
   
    //Listen for chatMessage
    socket.on('chatmessage',msg =>{
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message',formatMessage(user.username,msg))
    })

     socket.on('disconnect',()=>{
        const user = userLeave(socket.id);

        if(user){
        io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));

        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        })
        }
    })
    
})

const PORT = 2004|| process.env.PORT;

server.listen(PORT,()=> console.log(`Server running on port ${PORT}`));