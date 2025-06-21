import {
  Controller,
  Get,
  HttpCode,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { IdParamDto } from './dto/id-param.dto';
import { TokenDto } from './dto/token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Get(':id')
  async getToken(@Param() param: IdParamDto): Promise<TokenDto> {
    let id = Number.parseInt(param.id);
    if (Number.isNaN(id)) {
      throw new UnauthorizedException('Invalid user ID');
    }

    if (id >= 10000 && id <= 60000) {
      const token = this.authService.createAccessToken(id);
      return { token };
    } else {
      throw new UnauthorizedException('Invalid user ID');
    }
  }
}
