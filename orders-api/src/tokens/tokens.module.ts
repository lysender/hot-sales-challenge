import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TokensService } from './tokens.service';

@Module({
  imports: [ConfigModule, JwtModule],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
