import express from "express";
import dotenv from "dotenv";
// import {Database} from "./services/databaseService/databaseExports.js";
import {PostgresDB} from "./services/databaseService/database.js";
dotenv.config();

const db = PostgresDB.getInstance("write")

const app = express();
const port = Number(process.env.DB_SERVICE_PORT) || 3000;

app.get("/",(req,res)=>{
    res.json({success:true,message:"Database Server Active"});
})


app.listen(port, () => {
    console.log("Server Listening on port " + port);
})
