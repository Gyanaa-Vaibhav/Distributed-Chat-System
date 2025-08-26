import express from "express";
import dotenv from "dotenv";
import url from "node:url";
import path from "node:path";
import cors from 'cors';
dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.API_SERVER_PORT) || 3000;

app.set('trust proxy', true);
app.use(cors())

app.get("/",(req,res)=>{
   res.json({success:true,message:"API Gateway Working"})
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})