import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { SignupDto, isBlockedEmailDomain } from './dto/signup.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
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

    // Security: Reject login for BANNED accounts.
    // Use generic error to avoid revealing account status to attackers.
    if (user.status === 'BANNED') {
      throw new UnauthorizedException();
    }

    // Security: Prevent Admin accounts from logging in via the normal user login page
    if (user.role === 'ADMIN') {
      throw new UnauthorizedException('Admin accounts cannot login via the user portal.');
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

  async adminLogin(dto: LoginDto) {
    const user = this.db.getUserByEmail(dto.email);

    // Security: Use bcrypt.compare to safely validate password against hash
    if (!user) throw new UnauthorizedException();
    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException();
    }

    if (user.status === 'BANNED') {
      throw new UnauthorizedException();
    }

    // Security: Prevent normal users from logging in via the admin portal
    if (user.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can login via the admin portal.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    const { password, ...userWithoutPassword } = user;

    return {
      accessToken,
      expiresIn: 3600,
      user: userWithoutPassword,
    };
  }

  async signup(dto: SignupDto) {
    // Security: Reject known fake/disposable email domains
    if (isBlockedEmailDomain(dto.email)) {
      throw new BadRequestException({
        code: 'INVALID_EMAIL_DOMAIN',
        message: 'This email domain is not accepted. Please use a real email address.',
      });
    }

    // Check for existing email
    if (this.db.getUserByEmail(dto.email)) {
      throw new ConflictException({
        code: 'EMAIL_TAKEN',
        message: 'An account with this email already exists.',
      });
    }

    // Check for existing username
    if (this.db.getUserByUsername(dto.username)) {
      throw new ConflictException({
        code: 'USERNAME_TAKEN',
        message: 'This username is already taken. Please choose another.',
      });
    }

    // Security: Hash the password with bcrypt before storing
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = this.db.createUser(dto.email, dto.username, hashedPassword);

    const payload = { sub: newUser.id, email: newUser.email, role: newUser.role };
    const accessToken = await this.jwtService.signAsync(payload);

    const { password, ...userWithoutPassword } = newUser;

    return {
      accessToken,
      expiresIn: 3600,
      user: userWithoutPassword,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = this.db.users.get(userId);
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found.' });
    }

    // Check email uniqueness if changing
    if (dto.email && dto.email !== user.email) {
      if (this.db.getUserByEmail(dto.email)) {
        throw new ConflictException({ code: 'EMAIL_TAKEN', message: 'This email is already in use.' });
      }
    }

    // Check username uniqueness if changing
    if (dto.username && dto.username !== user.username) {
      if (this.db.getUserByUsername(dto.username)) {
        throw new ConflictException({ code: 'USERNAME_TAKEN', message: 'This username is already taken.' });
      }
    }

    const updates: Partial<typeof user> = {};
    if (dto.email) updates.email = dto.email;
    if (dto.username) updates.username = dto.username;
    if (dto.profilePicture !== undefined) updates.profilePicture = dto.profilePicture;

    // Security: Hash the new password if provided
    if (dto.password) {
      updates.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = this.db.updateUser(userId, updates);
    if (!updatedUser) throw new NotFoundException();

    const { password, ...userWithoutPassword } = updatedUser;
    return { user: userWithoutPassword };
  }
}
