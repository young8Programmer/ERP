import { Module } from '@nestjs/common';
import { GroupsService } from './group.service';
import { GroupsController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
