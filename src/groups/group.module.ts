import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { Teacher } from '../teacher/entities/teacher.entity';
import { Course } from '../courses/entities/course.entity';
import { Student } from '../students/entities/student.entity';
import { GroupsController } from './group.controller';
import { GroupsService } from './group.service';
import { Submission } from '../submissions/entities/submission.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { TeachersModule } from '../teacher/teacher.module';
import { CoursesModule } from '../courses/courses.module';
import { StudentsModule } from '../students/student.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, Teacher, Course, Student, Submission, Lesson, Assignment]),
    forwardRef(() => TeachersModule), // forwardRef() qo'llash
    forwardRef(() => CoursesModule),  // forwardRef() qo'llash
    forwardRef(() => StudentsModule), // forwardRef() qo'llash
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
