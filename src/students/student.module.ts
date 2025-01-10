import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './student.controller';
import { StudentsService } from './student.service';
import { Student } from './entities/user.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Teacher } from 'src/teacher/entities/teacher.entity';
import { User } from 'src/auth/entities/user.entity';
import { CoursesModule } from 'src/courses/courses.module';
import { GroupsModule } from 'src/groups/group.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Teacher, User, Group, Course]),
    GroupsModule,
    CoursesModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
