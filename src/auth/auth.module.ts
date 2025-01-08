import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { StudentsModule } from 'src/students/student.module';
import { TeachersModule } from 'src/teacher/teacher.module';
import { Student } from 'src/students/entities/user.entity';
import { Teacher } from 'src/teacher/entities/teacher.entity';
import { Profile } from 'src/profile/entities/profile.entity';
import { GroupsModule } from 'src/groups/group.module';
import { Group } from 'src/groups/entities/group.entity';
import { Course } from 'src/courses/entities/course.entity';
import { UsersModule } from 'src/users/users.module';
import { ProfilesModule } from 'src/profile/profile.module';
import { CoursesModule } from 'src/courses/courses.module';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, Teacher, Profile, Group, Course]),
    JwtModule.register({
      global: true,
      secret: "juda_secret_key",
      signOptions: { expiresIn: '1d' },
    }),
    StudentsModule,
    TeachersModule,
    GroupsModule,
    UsersModule,
    ProfilesModule,
    CoursesModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
