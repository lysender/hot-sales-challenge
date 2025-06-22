import { Injectable } from '@nestjs/common';
import { TokensService } from 'src/tokens/tokens.service';

/**
 * Default expires in 1 week
 */
const DEFAULT_EXPIRES_IN = 60 * 60 * 24 * 7;

@Injectable()
export class AuthService {
  constructor(private readonly tokensService: TokensService) {}

  createAccessToken(id: number): string {
    const payload = { sub: id.toString() };
    return this.tokensService.sign(payload, DEFAULT_EXPIRES_IN);
  }
}
