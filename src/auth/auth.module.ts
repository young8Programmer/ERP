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

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, Teacher]),
    JwtModule.register({
      global: true,
      secret: "juda_secret_key",
      signOptions: { expiresIn: '1d' },
    }),
    StudentsModule,
    TeachersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
