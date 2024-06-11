import {UserUseCases} from '@domain/use-cases';
import { UserRepository } from '@src/infras/db/repository';
import passport from 'passport';
import {Strategy as JWTStrategy, StrategyOptionsWithRequest } from 'passport-jwt';

const cookieExtractor = function(req: any) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['token'];
    }
    return token;
};

const options: StrategyOptionsWithRequest = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.JWT_SECRET!,
    passReqToCallback: true
};

const userUseCase = new UserUseCases(new UserRepository());

const strategy = new JWTStrategy(options, async (req, jwtPayload, done) => {
    const user = await userUseCase.getUserById(jwtPayload.id);
    if (user) {
        req.body.userId = user.id;
        done(null, user);
    } else {
        done(null, false);
    }
});

passport.use(strategy);
export default passport;
