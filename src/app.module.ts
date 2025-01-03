import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/entities/user.entity';
import { Course } from './courses/entities/course.entity';
import { StudentsModule } from './students/student.module';
import { CoursesModule } from './courses/courses.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profile/profile.module';
import { Profile } from './profile/entities/profile.entity';
import { TeachersModule } from './teacher/teacher.module';
import { Group } from './groups/entities/group.entity';
import { Student } from './students/entities/user.entity';
import { Teacher } from './teacher/entities/teacher.entity';
import { GroupsModule } from './groups/group.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'azizbek002',
      database: 'zxc',
      entities: [User, Course, Group, Profile, Student, Teacher],
      synchronize: true,
    }),
    CoursesModule,
    StudentsModule,
    AuthModule,
    ProfilesModule,
    TeachersModule,
    GroupsModule,
    UsersModule
  ],
})
export class AppModule {}
