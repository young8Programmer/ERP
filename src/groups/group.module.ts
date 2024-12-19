import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { Teacher } from '../teacher/entities/teacher.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Student } from 'src/students/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group, Teacher, Course, Student])],
  controllers: [],
  providers: [],
})
export class GroupsModule {}
