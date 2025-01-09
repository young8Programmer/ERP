import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersController } from './teacher.controller';
import { TeachersService } from './teacher.service';
import { Teacher } from './entities/teacher.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Student } from 'src/students/entities/user.entity';
import { User } from 'src/auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, Group, Student, User])],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}
