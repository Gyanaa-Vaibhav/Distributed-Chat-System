declare global {
    namespace Express {
        interface Request {
            user?: {username:string,email:string};
        }
    }
}

export {}