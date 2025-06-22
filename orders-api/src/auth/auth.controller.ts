import {
  Controller,
  Get,
  HttpCode,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccessTokenDto } from './dto/access-token.dto';
import { IdParamDto } from './dto/id-param.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Get(':id')
  async getToken(@Param() param: IdParamDto): Promise<AccessTokenDto> {
    const id = Number.parseInt(param.id);
    if (Number.isNaN(id)) {
      throw new UnauthorizedException('Invalid user ID');
    }

    if (id >= 10000 && id <= 60000) {
      const accessToken = this.authService.createAccessToken(id);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Invalid user ID');
    }
  }
}
