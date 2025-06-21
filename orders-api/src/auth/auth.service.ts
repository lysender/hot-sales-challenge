import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Algorithm } from 'jsonwebtoken';
import { AUTH_PRIVATE_KEY } from 'src/constants';

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

  createAccessToken(id: string): string {
    const key = this.configService.get(AUTH_PRIVATE_KEY) ?? '';
    const algo = 'RS256' as Algorithm;
    const options = {
      algorithm: algo,
      secret: key,
      expiresIn: DEFAULT_EXPIRES_IN,
    };

    const payload = { sub: id };
    return this.jwtService.sign(payload, options);
  }
}
