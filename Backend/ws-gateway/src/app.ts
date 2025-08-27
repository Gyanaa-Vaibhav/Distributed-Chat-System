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
    cors:{}
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

io.on("connection", async (socket) => {
    console.log("Connected to the server",socket.id);

    socket.on("join-room", ({ room }) => {
        socket.join(room);
        console.log(`Socket ${socket.id} Joined room ${room}`);
    });

    socket.on("leave-room", ({ room }) => {
        socket.leave(room);
        console.log(`Socket ${socket.id} left room ${room}`);
    });

    socket.on("message", async (data) => {
        const { message, room } = data;
        socket.broadcast.emit(room, message);
        await pubSub.publish(`room:${room}`, JSON.stringify({ message, sID: serverIdentifier, room }));
    });

    socket.on("disconnect", (data) => {
        console.log(data);
    })
})

await pubSub.pSubscribe('room:*', (m) => {
    const { message, sID, room } = JSON.parse(m);
    if (sID !== serverIdentifier) io.emit(room, message);
});

server.listen(port, () => {
    console.log("listening on PORT:", port);
})