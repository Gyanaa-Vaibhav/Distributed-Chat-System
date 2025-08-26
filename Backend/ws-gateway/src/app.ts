import express from "express";
import dotenv from "dotenv";
import * as http from "node:http";
import {Server} from "socket.io";
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

io.on("connection", (socket) => {
    console.log("Connected to the server",socket.id);

    socket.on("chat message", (data) => {
        console.log(data);
        io.emit("chat message", data);
    })
})

server.listen(port, () => {
    console.log("listening on PORT:", port);
})