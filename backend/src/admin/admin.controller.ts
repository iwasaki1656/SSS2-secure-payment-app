import { Controller, Get, Patch, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

/**
 * AdminController — all routes here are restricted to ADMIN role only.
 * Security (ASVS V4 / OWASP A01 Broken Access Control):
 * Both JwtAuthGuard (authentication) and RolesGuard (authorisation) are applied
 * at controller level so every endpoint inherits the protection.
 */
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /** List all registered users */
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  /** Update a user's account status (ban, limit, or reactivate) */
  @Patch('users/:id/status')
  @HttpCode(HttpStatus.OK)
  updateUserStatus(
    @Param('id') userId: string,
    @Body() body: { status: 'ACTIVE' | 'BANNED' | 'LIMITED' },
  ) {
    return this.adminService.updateUserStatus(userId, body.status);
  }

  /** View all transactions system-wide */
  @Get('transactions')
  getAllTransactions() {
    return this.adminService.getAllTransactions();
  }
}
