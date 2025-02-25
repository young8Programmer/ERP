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
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as path from 'path';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: path.join(__dirname, '..', 'uploads', 'submissions'),
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
        },
      }),
    }),
    TypeOrmModule.forFeature([Submission, Assignment, Group, Lesson, Course, Student, Teacher])
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
})
export class SubmissionsModule {}
