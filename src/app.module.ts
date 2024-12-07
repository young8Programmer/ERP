import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users/entities/user.entity';
import { Courses } from './courses/entities/course.entity';
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
      entities: [Users, Courses],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    CoursesModule,
    UsersModule,
  ],
})
export class AppModule {}
