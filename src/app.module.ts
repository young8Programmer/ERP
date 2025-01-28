import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './courses/entities/course.entity';
import { StudentsModule } from './students/student.module';
import { CoursesModule } from './courses/courses.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profile/profile.module';
import { Profile } from './profile/entities/profile.entity';
import { TeachersModule } from './teacher/teacher.module';
import { Group } from './groups/entities/group.entity';
import { Student } from './students/entities/student.entity';
import { Teacher } from './teacher/entities/teacher.entity';
import { GroupsModule } from './groups/group.module';
import { Lesson } from './lesson/entities/lesson.entity';
import { Assignment } from './assignments/entities/assignment.entity';
import { Submission } from './submissions/entities/submission.entity';
import { LessonsModule } from './lesson/lesson.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { AttendanceModule } from './attendance/attendance.module';
import { Attendance } from './attendance/entities/attendance.entity';
import { AdminModule } from './admin/admin.module';
import { Admin } from './admin/entities/admin.entity';
import { SuperAdminModule } from './super-admin/super-admin.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'erpbackend',
      entities: [
        Course,
        Group,
        Profile,
        Student,
        Teacher,
        Lesson,
        Assignment,
        Submission,
        Attendance,
        Admin
      ],
      synchronize: true,
    }),
    CoursesModule,
    StudentsModule,
    AuthModule,
    ProfilesModule,
    TeachersModule,
    GroupsModule,
    LessonsModule,
    AssignmentsModule,
    SubmissionsModule,
    AttendanceModule,
    AdminModule,
    SuperAdminModule,
  ],
  controllers: [],
  providers: [],
})


export class AppModule {}




