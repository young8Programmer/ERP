import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './student.controller';
import { StudentsService } from './student.service';
import { Student } from './entities/user.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Course } from 'src/courses/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Group, Course])],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
