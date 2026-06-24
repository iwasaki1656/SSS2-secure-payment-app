import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = this.db.getUserByEmail(dto.email);
    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    // Return User object without password
    const { password, ...userWithoutPassword } = user;

    return {
      accessToken,
      expiresIn: 3600,
      user: userWithoutPassword,
    };
  }
}
