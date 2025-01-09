import { Module } from '@nestjs/common';
import { LessonsService } from './lesson.service';
import { LessonsController } from './lesson.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Group } from '../groups/entities/group.entity';
import { GroupsModule } from 'src/groups/group.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, Group]), GroupsModule], // GroupsModule ni import qilish
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}
