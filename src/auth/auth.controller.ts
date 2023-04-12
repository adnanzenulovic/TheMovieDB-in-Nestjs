import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signup(@Body() dto: AuthDto, @Res() res: Response) {
    const tokens = await this.authService.signup(dto);

    return res
      .cookie('access_token', tokens.access_token, {
        httpOnly: true,
      })
      .cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
      })
      .send();
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() dto: AuthDto, @Res() res: Response) {
    const tokens = await this.authService.signin(dto);

    return res
      .cookie('access_token', tokens.access_token, {
        httpOnly: true,
      })
      .cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
      })
      .send({ message: true });
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response) {
    const refresh_token = req.cookies['refresh_token'];
    return res.send(await this.authService.logout(refresh_token));
  }
}
