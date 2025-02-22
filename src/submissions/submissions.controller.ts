import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Req,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { SubmissionService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { GradeSubmissionDto } from './dto/GradeSubmissionDto';
import { AuthGuard, Roles, RolesGuard } from 'src/auth/auth.guard';
import { SubmissionStatus } from './entities/submission.entity';

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
    if (!req.user || !req.user.id) throw new ForbiddenException('User not authenticated');
    return this.submissionsService.submitAnswer(req.user.id, createSubmissionDto, assignmentId);
  }

  @UseGuards(AuthGuard)
  @Get('all')
  async getAllSubmissions(@Req() req) {
    if (!req.user || !req.user.id) throw new ForbiddenException('User not authenticated');
    return this.submissionsService.getAllSubmissions();
  }

  @Roles('teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':submissionId/grade')
  async gradeSubmission(
    @Req() req,
    @Param('submissionId') submissionId: number,
    @Body() gradeSubmissionDto: GradeSubmissionDto,
  ) {
    if (!req.user || !req.user.id) throw new ForbiddenException('User not authenticated');
    return this.submissionsService.gradeSubmission(req.user.id, submissionId, gradeSubmissionDto);
  }

  @Roles('teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @Get('lesson/:lessonId')
  async getLessonSubmissions(@Req() req, @Param('lessonId') lessonId: number) {
    if (!req.user || !req.user.id) throw new ForbiddenException('User not authenticated');
    return this.submissionsService.getLessonSubmissions(req.user.id, lessonId);
  }

  @UseGuards(AuthGuard)
  @Get('daily-grades/:groupId')
  async getDailyGrades(@Req() req, @Param('groupId') groupId: number) {
    return this.submissionsService.getDailyGrades(req.user.id, groupId);
  }

  @UseGuards(AuthGuard)
  @Get('total-scores/:groupId')
  async getTotalScores(@Param('groupId') groupId: number) {
    return this.submissionsService.getTotalScores(groupId);
  }

  // // ✅ Yangi endpointlar:
  // @Roles('teacher')
  // @UseGuards(AuthGuard, RolesGuard)
  // @Get('passed')
  // async getPassedStudents() {
  //   return this.submissionsService.getPassedStudents();
  // }

  // @Roles('teacher')
  // @UseGuards(AuthGuard, RolesGuard)
  // @Get('rejected')
  // async getRejectedSubmissions() {
  //   return this.submissionsService.getRejectedSubmissions();
  // }

  // @Roles('teacher')
  // @UseGuards(AuthGuard, RolesGuard)
  // @Get('pending')
  // async getPendingSubmissions() {
  //   return this.submissionsService.getPendingSubmissions();
  // }

  // @Roles('teacher')
  // @UseGuards(AuthGuard, RolesGuard)
  // @Get('accepted')
  // async getAcceptedSubmissions() {
  //   return this.submissionsService.getAcceptedSubmissions();
  // }

  @Roles('teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @Get('lesson/:lessonId/status/:status')
  async getLessonSubmissionsByStatus(
  @Req() req,
  @Param('lessonId') lessonId: number,
  @Param('status') status: SubmissionStatus,
) {
  if (!req.user || !req.user.id) throw new ForbiddenException('User not authenticated');
  return this.submissionsService.getLessonSubmissionsByStatus(req.user.id, lessonId, status);
}


  @Roles('teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @Get(':assignmentId/unsubmitted')
  async getUnsubmittedStudents(@Param('assignmentId') assignmentId: number) {
    return this.submissionsService.getUnsubmittedStudents(assignmentId);
  }
}
