import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Req,
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { SubmissionService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { GradeSubmissionDto } from './dto/GradeSubmissionDto';
import { AuthGuard, Roles, RolesGuard } from 'src/auth/auth.guard';


@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionsService: SubmissionService) {}

  @Roles('student')
  @UseGuards(AuthGuard, RolesGuard)
  @Post(':assignmentId/submit')
  async submitAnswer(
    @Req() req,
    @Param('assignmentId') assignmentId: number,
    @Body() createSubmissionDto: CreateSubmissionDto,
  ) {
    if (!req.user || !req.user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    const userId = req.user.id;
    return this.submissionsService.submitAnswer(
      userId,
      createSubmissionDto.content,
      assignmentId,
    );
  }

  @UseGuards(AuthGuard)
  @Get('all')
  async getAllSubmissions(@Req() req) {
    if (!req.user || !req.user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    const userId = req.user.id;
    return this.submissionsService.getAllSubmissions(userId);
  }

  @Roles('teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':submissionId/grade')
  async gradeSubmission(
    @Req() req,
    @Param('submissionId') submissionId: number,
    @Body() gradeSubmissionDto: GradeSubmissionDto,
  ) {
    if (!req.user || !req.user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    const userId = req.user.id;
    return this.submissionsService.gradeSubmission(
      userId,
      submissionId,
      gradeSubmissionDto.grade,
    );
  }

  @UseGuards(AuthGuard)
  @Get('daily-grades/:groupId')
  async getDailyGrades(
    @Req() req,
    @Param('groupId') groupId: number,
  ) {
    const userId = req.user.id;
    return this.submissionsService.getDailyGrades(userId, groupId);
  }

  @UseGuards(AuthGuard)
  @Get('total-scores/:groupId')
  async getTotalScores(
    @Req() req,
    @Param('groupId') groupId: number,
  ) {
    const userId = req.user.id;
    return this.submissionsService.getTotalScores(userId, groupId);
  }
}
