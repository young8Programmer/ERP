import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Courses } from './courses/entities/course.entity';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { AuthModule } from './auth/auth.module';
import { Auth } from './auth/entities/auth.entity';
import { User } from './users/entities/user.entity';
import { Profile } from './profile/entities/profile.entity';
import { ProfileModule } from './profile/profile.module';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { LessonModule } from './lesson/lesson.module';
import { Lesson } from './lesson/entities/lesson.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'azizbek002',
      database: 'qwe',
      entities: [User, Courses, Auth, Profile, Payment, Lesson],
      synchronize: true,
    }),
    CoursesModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    PaymentsModule,
    LessonModule,
  ],
})
export class AppModule {}
