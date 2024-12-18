import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsService } from './group.service';
import { GroupsController } from './group.controller';
import { Group } from './entities/group.entity';
import { Student } from 'src/students/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Teacher } from 'src/teacher/entities/teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group, Student, Course, Teacher])],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupModule {}
