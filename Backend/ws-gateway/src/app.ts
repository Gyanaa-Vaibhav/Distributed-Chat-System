import express from "express";
import dotenv from "dotenv";
import * as http from "node:http";
import {Server} from "socket.io";
import {pubSub} from './serviceImports.js'
dotenv.config();

const app = express();
const port = Number(process.env.WS_GATEWAY_PORT) || 3000;
const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        // origin:
    }
})

app.get("/",(req,res)=>{
    res.json({success:true,message:"WS Server Active"});
})

function generateRandom8DigitCode() {
    const number = Math.floor(10000000 + Math.random() * 90000000); // ensures 8 digits
    const str = number.toString();
    return str.slice(0, 4) + '-' + str.slice(4);
}

const serverIdentifier = generateRandom8DigitCode();
console.log(serverIdentifier);

io.on("connection", async (socket) => {
    console.log("Connected to the server",socket.id);

    socket.on("message", async (data) => {
        console.log(data);
        const { message, room} = data
        // io.emit("message", data);
        socket.broadcast.emit(room, message);
        await pubSub.publish("Messages",JSON.stringify({message:message,sID:serverIdentifier,room:room}));
    })

    socket.on("Test",async (data) => {
        console.log(data);
        socket.broadcast.emit("Test",data);
        await pubSub.publish("Messages",JSON.stringify({message:data,sID:serverIdentifier}));
    })

    socket.on("disconnect", (data) => {
        console.log(data);
    })
})

await pubSub.subscribe('Messages',(m)=>{
    console.log(m)
    const {message,sID,room} = JSON.parse(m);
    console.log("From Subscribe",message);
    if(sID !== serverIdentifier) io.emit(room,`${message} FROM Subscribe EVENT`);
})

server.listen(port, () => {
    console.log("listening on PORT:", port);
})