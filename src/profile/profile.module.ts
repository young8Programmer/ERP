import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profile.controller';
import { ProfilesService } from './profile.service';
import { Profile } from './entities/profile.entity';
import { User } from 'src/auth/entities/user.entity';
import { Student } from 'src/students/entities/user.entity';
import { Teacher } from 'src/teacher/entities/teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, User, Student, Teacher])],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
