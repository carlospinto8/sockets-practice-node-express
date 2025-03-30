import { Router } from 'express';
import { AT_KEY } from '../utils';

export default function users() {
    const router = Router();

    router
        .get('/', (req, res, next) => {
            res.json({
                id: 1,
                firstname: 'Matt',
                lastname: 'Morgan',
            });
        }).get('/login', (req, res, next) => {
          // Check creds
          // Encode token (For now we are using test for development. TODO: change this!)
          const encodedToken = 'test';
          res.cookie(AT_KEY, encodedToken, {
            httpOnly: true,
            signed: true,
          });
          // Respond with 200 and our token on success
          res.status(200).send(encodedToken)

        }).get('/logout', (req, res, next) => {
           res.clearCookie(AT_KEY);
           res.status(200).send()
        });

    return router;
}