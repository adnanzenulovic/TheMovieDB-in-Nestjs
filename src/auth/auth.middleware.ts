import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const at = req.cookies['access_token'];
      const rt = req.cookies['refresh_token'];
      if (rt === undefined || at === undefined) {
        throw new Error();
      }

      const { access_token, refresh_token } = await this.authService.jwtVerify(
        at,
        rt,
      );

      if (!refresh_token) throw new Error();

      if (access_token || refresh_token) {
        const validToken = access_token || refresh_token;
        const newAccessToken = await this.authService.getAccessToken(
          validToken._id.toString(),
          validToken.email,
        );
        res.cookie('access_token', newAccessToken, {
          httpOnly: true,
        });
      } else {
        throw new Error();
      }

      next();
    } catch (error) {
      return res.render('login');
    }
  }
}
