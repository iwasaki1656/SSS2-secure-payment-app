import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = this.db.getUserByEmail(dto.email);

    // Security: Use bcrypt.compare to safely validate password against hash
    if (!user) throw new UnauthorizedException();
    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
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

