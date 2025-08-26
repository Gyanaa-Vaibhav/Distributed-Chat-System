import jwt, {decode} from 'jsonwebtoken'
import {Request,Response,NextFunction} from "express";
import dotenv from 'dotenv'

dotenv.config();
const accessKey = process.env.ACCESS_SECRET!;
const refreshKey = process.env.REFRESH_SECRET!;

if(!accessKey || !refreshKey){
    throw new Error('Access Key or Refresh Key is missing')
}

export function generateAccessToken(payload: string | object) {
    return jwt.sign(payload, accessKey, { expiresIn: '6h' });
}

export function generateRefreshToken(payload: string | object) {
    return jwt.sign(payload, refreshKey, { expiresIn: '7d' });
}

export function jwtTokenValidator(req:Request, res:Response, next:NextFunction){
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Authorization token missing or malformed'
        });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, accessKey, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token has expired'
                });
            }
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = decoded as {username:string,email:string};

        next();
    });
}

export function refreshToken(req:Request, res:Response, next:NextFunction){
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({ success: false, error: 'Refresh token is missing' });
        }

        const user = jwt.verify(token, refreshKey) as {username:string,email:string}

        const newAccessToken = jwt.sign(
            {
                username:user.username,
                email: user.email
            },
            accessKey,
            { expiresIn: '6h' }
        );
        req.user = user;

        return res.status(200).json({ success: true, accessToken: newAccessToken });

    } catch (error) {
        next(error);
    }
}