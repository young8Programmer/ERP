import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { Group } from '../groups/entities/group.entity';
import { Teacher } from '../teacher/entities/teacher.entity';
import { Student } from '../students/entities/student.entity';
import { GroupsModule } from '../groups/group.module';
import { TeachersModule } from '../teacher/teacher.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Group, Teacher, Student]),
    forwardRef(() => GroupsModule),
    forwardRef(() => TeachersModule),
  ],
  providers: [CoursesService],
  controllers: [CoursesController],
})
export class CoursesModule {}
