import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from 'src/students/entities/student.entity';
import { Profile } from 'src/profile/entities/profile.entity';
import { ProfilesModule } from 'src/profile/profile.module';
import { StudentsService } from './student.service';
import { Group } from 'src/groups/entities/group.entity';
import { StudentsController } from './student.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Profile, Group])
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
