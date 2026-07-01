import { Controller, Post, Put, Body, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    // Security: User ID is extracted from the verified JWT payload, not from the request body
    return this.authService.updateProfile(req.user.sub, updateProfileDto);
  }
}
