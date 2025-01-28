import { Module, forwardRef } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { Teacher } from '../teacher/entities/teacher.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Student } from '../students/entities/student.entity';
import { LessonsModule } from '../lesson/lesson.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Teacher, Lesson, Student])
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
