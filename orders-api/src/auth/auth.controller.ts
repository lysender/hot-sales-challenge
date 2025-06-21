import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IdParamDto } from './dto/id-param.dto';
import { TokenDto } from './dto/token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Get(':id')
  async getToken(@Param() param: IdParamDto): Promise<TokenDto> {
    const token = this.authService.createAccessToken(param.id);
    return { token };
  }
}
