import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './students/entities/user.entity';
import { Course } from './courses/entities/course.entity';
import { StudentModel } from './students/student.module';
import { CoursesModule } from './courses/courses.module';
import { AuthModule } from './auth/auth.module';
import { Auth } from './auth/entities/auth.entity';
import { ProfileModule } from './profile/profile.module';
import { Profile } from './profile/entities/profile.entity';
import { AdminModule } from './admin/admin.module';
import { TeacherModule } from './teacher/teacher.module';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'erp',
      entities: [User, Course, Auth, Profile, Payment],
      synchronize: true,
    }),
    CoursesModule,
    StudentModel,
    AuthModule,
    ProfileModule,
    AdminModule,
    TeacherModule,
    PaymentsModule
  ],
})
export class AppModule {}
