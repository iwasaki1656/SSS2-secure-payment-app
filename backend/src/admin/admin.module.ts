import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

// DatabaseModule is @Global() — DatabaseService is available without explicit import
@Module({
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

