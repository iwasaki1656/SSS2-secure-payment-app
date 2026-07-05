import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module'; // Added AuthModule

// DatabaseModule is @Global() — DatabaseService is available without explicit import
@Module({
  imports: [AuthModule], // Provide AuthModule for JwtAuthGuard dependencies
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

