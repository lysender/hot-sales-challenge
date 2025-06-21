import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_PUBLIC_KEY } from 'src/constants';
import { Nullable } from 'src/shared/nullable';
import { UserDto } from './dto/user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(AUTH_PUBLIC_KEY) ?? '',
      passReqToCallback: true,
    });
  }

  async validate(_req: Request, payload: object) {
    let actor: Nullable<UserDto> = null;

    if (payload?.['sub']) {
      const userId = payload['sub'];
      // We only need userId for simplicity
      const id = Number.parseInt(userId, 10);
      if (id && !Number.isNaN(id)) {
        if (id >= 10000 && id <= 60000) {
          actor = { id };
        }
      }
    }
    if (!actor) {
      throw new UnauthorizedException('Unauthorized');
    }

    return actor;
  }
}
