import {UserUseCases} from '@domain/use-cases';
import passport from 'passport';
import {Strategy as JWTStrategy, ExtractJwt} from 'passport-jwt';

const cookieExtractor = function(req: any) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['JWT_SESSION'];
    }
    return token;
};

const options = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.JWT_SECRET!,
};


export default function createPassportMiddleware(userUseCase: UserUseCases) {
    const strategy = new JWTStrategy(options, async (jwtPayload, done) => {
        const user = await userUseCase.getUserById(jwtPayload.id);
        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
    passport.use(strategy);
    return passport;
}
