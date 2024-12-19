import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersController } from './teacher.controller';
import { TeachersService } from './teacher.service';
import { Teacher } from './entities/teacher.entity';
import { Group } from 'src/groups/entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, Group])],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}
