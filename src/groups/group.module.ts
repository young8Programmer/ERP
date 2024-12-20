import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { Teacher } from '../teacher/entities/teacher.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Student } from 'src/students/entities/user.entity';
import { GroupsController } from './group.controller';
import { GroupsService } from './group.service';

@Module({
  imports: [TypeOrmModule.forFeature([Group, Teacher, Course, Student])],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
