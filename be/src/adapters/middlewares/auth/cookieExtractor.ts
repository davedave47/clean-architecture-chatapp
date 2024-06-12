import jwt from 'jsonwebtoken'
require('dotenv').config()
export default function jwtExtract(req: any, res: any, next: any) {
    const token = req.cookies['token']
    if (token) {
        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
            req.body.id = decodedToken.id;
        } catch (e) {
            console.error('Error decoding token', e);
        }
    }
    next();
}