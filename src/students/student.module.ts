import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './student.controller';
import { StudentsService } from './student.service';
import { Student } from "./entities/user.entity";
import { Group } from 'src/groups/entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Group])],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
