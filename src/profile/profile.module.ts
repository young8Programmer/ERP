import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profile.controller';
import { ProfilesService } from './profile.service';
import { Profile } from './entities/profile.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teacher/entities/teacher.entity';
import { Admin } from '../admin/entities/admin.entity'; // admin entityni to'g'ri import qilish
import { StudentsModule } from '../students/student.module';
import { TeachersModule } from '../teacher/teacher.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, Student, Teacher, Admin])
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
