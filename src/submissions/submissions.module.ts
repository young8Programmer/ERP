import { Module } from '@nestjs/common';
import { SubmissionService } from './submissions.service';
import { SubmissionController } from './submissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { User } from 'src/auth/entities/user.entity';
import { Group } from 'src/groups/entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Submission, Assignment, User, Group])],
  controllers: [SubmissionController],
  providers: [SubmissionService],
})
export class SubmissionsModule {}
