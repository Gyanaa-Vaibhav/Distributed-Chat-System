import express from "express";
import dotenv from "dotenv";
import url from "node:url";
import path from "node:path";
dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.AUTH_SERVICE_PORT) || 3000;

app.get("/",(req,res)=>{
    res.json({success:true,message:"Auth Service Working"})
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})