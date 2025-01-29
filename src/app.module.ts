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
import { superAdmin } from './super-admin/entities/super-admin.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'dpg-cucu52lumphs73dd132g-a.oregon-postgres.render.com', // External host
      port: 5432,
      username: 'erp_backend_q6ec_user',
      password: '5lo72umGn6JiabGZL1W3UOGVFEKYBXg1',
      database: 'erp_backend_q6ec',
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
        Admin,
        superAdmin
      ],
      synchronize: true, // Production uchun false qilib qo'ying
      ssl: {
        rejectUnauthorized: false, // Render uchun SSL kerak
      },
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



