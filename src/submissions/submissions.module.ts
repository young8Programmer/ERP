import { Module, forwardRef } from '@nestjs/common';
import { SubmissionService } from './submissions.service';
import { SubmissionController } from './submissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { Group } from '../groups/entities/group.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Course } from '../courses/entities/course.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teacher/entities/teacher.entity';
import { GroupsModule } from '../groups/group.module';
import { LessonsModule } from '../lesson/lesson.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, Assignment, Group, Lesson, Course, Student, Teacher])
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
})
export class SubmissionsModule {}
