import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Algorithm } from 'jsonwebtoken';
import { Nullable } from 'src/shared/nullable';
import { JWT_AUTH_KEY } from '../constants';

@Injectable()
export class TokensService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  sign(data: any, expiresIn: number): string {
    const key = this.configService.get(JWT_AUTH_KEY);
    const algo = 'HS256' as Algorithm;
    const options = {
      algorithm: algo,
      secret: key,
      expiresIn: expiresIn,
    };

    return this.jwtService.sign(data, options);
  }

  verify<T>(token: string): Nullable<T> {
    let decoded: Nullable<T> = null;
    const key = this.configService.get(JWT_AUTH_KEY);
    if (key) {
      const algo = 'HS256' as Algorithm;
      const options = {
        algorithm: algo,
        secret: key,
      };
      try {
        const result = this.jwtService.verify(token, options);
        if (result) {
          decoded = result as T;
        }
      } catch (_e) {
        decoded = null;
      }
    }
    return decoded;
  }
}
