import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { SignupDto, isBlockedEmailDomain } from './dto/signup.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  // Security: JWT Blocklist — revoked token JTIs are stored here in memory.
  // In production, this would be a Redis cache with TTL matching JWT expiry.
  private readonly blockedTokens = new Set<string>();

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = this.db.getUserByEmail(dto.email);

    // Security: Vague error — never reveal whether email exists or not
    if (!user) throw new UnauthorizedException('Invalid email or password.');

    // Security: Account Lockout — check if the account is currently locked
    // After 5 failed attempts, the account is locked for 15 minutes.
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
    if (user.lockoutUntil && new Date() < user.lockoutUntil) {
      const remaining = Math.ceil(
        (user.lockoutUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account temporarily locked due to too many failed attempts. Try again in ${remaining} minute(s).`,
      );
    }

    // Security: Use bcrypt.compare to safely validate password against hash
    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      // Increment failed counter
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
        user.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        throw new UnauthorizedException(
          `Too many failed attempts. Account locked for 15 minutes.`,
        );
      }
      const attemptsLeft = MAX_ATTEMPTS - user.failedLoginAttempts;
      throw new UnauthorizedException(
        `Invalid email or password. ${attemptsLeft} attempt(s) remaining.`,
      );
    }

    // Security: Reject login for BANNED accounts.
    if (user.status === 'BANNED') {
      throw new UnauthorizedException('This account has been suspended.');
    }

    // Security: Prevent Admin accounts from logging in via the normal user login page
    if (user.role === 'ADMIN') {
      throw new UnauthorizedException(
        'Admin accounts cannot login via the user portal.',
      );
    }

    // Successful login: reset the failed attempts counter
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;

    // Security: JWT Blocklist — include a unique jti so individual tokens can be revoked
    const jti = uuidv4();
    const payload = { sub: user.id, email: user.email, role: user.role, jti };
    const accessToken = await this.jwtService.signAsync(payload);

    // Return User object without sensitive data
    const { password, transactionPin, ...userWithoutSensitive } = user;

    return {
      accessToken,
      expiresIn: 3600,
      user: { ...userWithoutSensitive, transactionPinSet: !!transactionPin },
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
      throw new UnauthorizedException(
        'Only admins can login via the admin portal.',
      );
    }

    const jti = uuidv4();
    const payload = { sub: user.id, email: user.email, role: user.role, jti };
    const accessToken = await this.jwtService.signAsync(payload);

    const { password, transactionPin, ...userWithoutSensitive } = user;

    return {
      accessToken,
      expiresIn: 3600,
      user: { ...userWithoutSensitive, transactionPinSet: !!transactionPin },
    };
  }

  async signup(dto: SignupDto) {
    // Security: Reject known fake/disposable email domains
    if (isBlockedEmailDomain(dto.email)) {
      throw new BadRequestException({
        code: 'INVALID_EMAIL_DOMAIN',
        message:
          'This email domain is not accepted. Please use a real email address.',
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

    // Security: Hash the password with bcrypt (rounds=12) before storing
    const hashedPassword = await bcrypt.hash(dto.password, 12);
    // Security: Hash the transaction PIN with bcrypt if provided
    const hashedPin = dto.transactionPin
      ? await bcrypt.hash(dto.transactionPin, 12)
      : undefined;
    const newUser = this.db.createUser(
      dto.email,
      dto.username,
      hashedPassword,
      hashedPin,
    );

    const jti = uuidv4();
    const payload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      jti,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    const { password, transactionPin, ...userWithoutSensitive } = newUser;

    return {
      accessToken,
      expiresIn: 3600,
      user: { ...userWithoutSensitive, transactionPinSet: !!transactionPin },
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = this.db.users.get(userId);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    // Check email uniqueness if changing
    if (dto.email && dto.email !== user.email) {
      if (this.db.getUserByEmail(dto.email)) {
        throw new ConflictException({
          code: 'EMAIL_TAKEN',
          message: 'This email is already in use.',
        });
      }
    }

    // Check username uniqueness if changing
    if (dto.username && dto.username !== user.username) {
      if (this.db.getUserByUsername(dto.username)) {
        throw new ConflictException({
          code: 'USERNAME_TAKEN',
          message: 'This username is already taken.',
        });
      }
    }

    const updates: Partial<typeof user> = {};
    if (dto.email) updates.email = dto.email;
    if (dto.username) updates.username = dto.username;
    if (dto.profilePicture !== undefined)
      updates.profilePicture = dto.profilePicture;

    // Security: Hash the new password if provided
    if (dto.password) {
      updates.password = await bcrypt.hash(dto.password, 12);
    }
    // Security: Hash the new transaction PIN if provided
    if (dto.transactionPin) {
      updates.transactionPin = await bcrypt.hash(dto.transactionPin, 12);
    }

    const updatedUser = this.db.updateUser(userId, updates);
    if (!updatedUser) throw new NotFoundException();

    const { password, transactionPin, ...userWithoutSensitive } = updatedUser;
    return {
      user: { ...userWithoutSensitive, transactionPinSet: !!transactionPin },
    };
  }

  /** Security: True session invalidation — adds the token's jti to the blocklist */
  logout(jti: string): void {
    this.blockedTokens.add(jti);
  }

  /** Called by JwtAuthGuard to check if a token has been revoked */
  isTokenBlocked(jti: string): boolean {
    return this.blockedTokens.has(jti);
  }
}
