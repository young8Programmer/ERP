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
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesStudentGuard } from 'src/auth/rolesStudentGuard';
import { Roles } from 'src/auth/roles.guard';
import { RolesTeacherGuard } from 'src/auth/rolesTeacherGuard';

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionsService: SubmissionService) {}

  @UseGuards(AuthGuard, RolesStudentGuard)
  @Roles("student")
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
      assignmentId
    );
  }

  
  @UseGuards(AuthGuard)
  @Roles("student")
  @Get("all")
  async getallSubmissions(
    @Req() req
  ) {
    if (!req.user || !req.user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    const userId = req.user.id;
    return this.submissionsService.getAllSubmissions(
      userId
    );
  }


  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles("teacher")
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
  @Get('daily-grades')
  async getDailyGrades(@Req() req) {
    const userId = req.user.id;
    return this.submissionsService.getDailyGrades(userId);
  }

  @UseGuards(AuthGuard)
  @Get('total-scores')
  async getTotalScores(@Req() req) {
    const userId = req.user.id
    return this.submissionsService.getTotalScores(userId);
  }
}
