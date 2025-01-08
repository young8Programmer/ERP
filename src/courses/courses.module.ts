import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Teacher } from 'src/teacher/entities/teacher.entity';
import { Student } from 'src/students/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Group, Teacher, Student])],
  providers: [CoursesService],
  controllers: [CoursesController],
})
export class CoursesModule {}
