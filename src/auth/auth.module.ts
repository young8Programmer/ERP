import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/students/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { StudentModel } from 'src/students/student.module';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: "juda_secret_key",
      signOptions: { expiresIn: '1d' },
    }),
    StudentModel,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
