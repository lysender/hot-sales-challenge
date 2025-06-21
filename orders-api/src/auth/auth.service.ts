import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Algorithm } from 'jsonwebtoken';
import { JWT_AUTH_KEY } from 'src/constants';

/**
 * Default expires in 1 week
 */
const DEFAULT_EXPIRES_IN = 60 * 60 * 24 * 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  createAccessToken(id: number): string {
    const key = this.configService.get(JWT_AUTH_KEY) ?? '';
    const algo = 'HS256' as Algorithm;
    const options = {
      algorithm: algo,
      secret: key,
      expiresIn: DEFAULT_EXPIRES_IN,
    };

    const payload = { sub: id.toString() };
    return this.jwtService.sign(payload, options);
  }
}
