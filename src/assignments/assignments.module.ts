import { Module, forwardRef } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Teacher } from '../teacher/entities/teacher.entity';
import { Student } from '../students/entities/student.entity';
import { LessonsModule } from '../lesson/lesson.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment, Lesson, Teacher, Student]),
    forwardRef(() => LessonsModule),
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
})
export class AssignmentsModule {}
