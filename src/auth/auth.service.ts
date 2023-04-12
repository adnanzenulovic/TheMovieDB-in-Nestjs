import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthDto } from './dto';
import { Auth } from './entities/auth.entity';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, Tokens } from './types';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('Auth') private readonly users: Model<Auth>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto): Promise<Tokens> {
    try {
      const hash = await this.hashData(dto.password);
      const user = new this.users({ email: dto.email, hash });

      await user.save();

      const tokens = await this.getTokens(user._id.toString(), user.email);
      await this.updateRtHash(user.id.toString(), tokens.refresh_token);

      return tokens;
    } catch (error) {
      if (error.code == 11000)
        throw new ForbiddenException('Email already used!');
      else throw new Error();
    }
  }

  async signin(dto: AuthDto): Promise<Tokens> {
    const user = await this.findByEmail(dto.email);
    if (!user) throw new ForbiddenException('Access Denied');

    if (!(await argon.verify(user.hash, dto.password))) {
      throw new ForbiddenException('Credentials incorrect');
    }

    const tokens = await this.getTokens(user._id.toString(), user.email);
    await this.updateRtHash(user.id.toString(), tokens.refresh_token);

    return tokens;
  }

  async logout(refresh_token: string): Promise<boolean> {
    try {
      const user = await this.jwtVerify(null, refresh_token);
      await this.users
        .findOneAndUpdate(
          { _id: user.refresh_token._id },
          { $set: { hashRt: null } },
        )
        .exec();

      return true;
    } catch (e) {
      return false;
    }
  }

  async findByEmail(email: string) {
    return await this.users.findOne({ email }).exec();
  }
  async findById(_id) {
    return await this.users.findOne({ _id: new Types.ObjectId(_id) }).exec();
  }

  async jwtVerify(access_token: string, refresh_token: string) {
    let at, rt;

    try {
      const at_temp = jwt.verify(access_token, this.config.get('AT_SECRET'), {
        ignoreExpiration: true,
      });

      at = await this.findById(at_temp.sub);
    } catch (e) {
      at = null;
    }
    try {
      const rt_temp = await jwt.verify(
        refresh_token,
        this.config.get('RT_SECRET'),
      );
      rt = await this.findById(rt_temp.sub);

      await argon.verify(rt.hashRt, refresh_token);
    } catch (e) {
      rt = null;
    }

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  hashData(data: string) {
    return argon.hash(data);
  }
  async updateRtHash(userId: string, rt: string): Promise<any> {
    const hash = await this.hashData(rt);

    const user = await this.users
      .updateOne({ _id: userId }, { $set: { hashRt: hash } })
      .exec();

    return user;
  }

  async getAccessToken(userId: number, email: string): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        email,
      },
      {
        expiresIn: '15m',
        secret: this.config.get('AT_SECRET'),
      },
    );
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        expiresIn: '15m',
        secret: this.config.get('AT_SECRET'),
      }),
      this.jwtService.signAsync(jwtPayload, {
        expiresIn: '7d',
        secret: this.config.get('RT_SECRET'),
      }),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
