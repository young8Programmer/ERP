import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { Teacher } from '../teacher/entities/teacher.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Student } from 'src/students/entities/user.entity';
import { GroupsController } from './group.controller';
import { GroupsService } from './group.service';
import { User } from 'src/auth/entities/user.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
import { Lesson } from 'src/lesson/entities/lesson.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      Teacher,
      Course,
      Student,
      User,
      Submission,
      Lesson,
      Assignment,
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
