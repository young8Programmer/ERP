import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Course } from './courses/entities/course.entity';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'erp',
      entities: [User, Course],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    CoursesModule,
    UsersModule,
  ],
})
export class AppModule {}
