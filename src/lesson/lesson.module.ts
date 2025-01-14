import { Module } from '@nestjs/common';
import { LessonsService } from './lesson.service';
import { LessonsController } from './lesson.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Group } from '../groups/entities/group.entity';
import { GroupsService } from 'src/groups/group.service';
import { User } from 'src/auth/entities/user.entity';
import { Student } from 'src/students/entities/student.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, Group, User, Attendance])],
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}
