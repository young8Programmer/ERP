import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Param,
  Body,
  Req,
  ForbiddenException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { SubmissionService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { GradeSubmissionDto } from './dto/GradeSubmissionDto';
import { AuthGuard, Roles, RolesGuard } from 'src/auth/auth.guard';
import { SubmissionStatus } from './entities/submission.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionsService: SubmissionService) {}

  @Roles('student')
  @UseGuards(AuthGuard, RolesGuard)
  @Post(':assignmentId/submit')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async submitAssignment(
    @Req() req,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @UploadedFile() file: any,
    @Body('comment') comment: string,
  ) {
    const userId = req.user.id;

    if (!file) {
      throw new ForbiddenException('Fayl noto‘g‘ri yuklangan yoki yo‘q');
    }

    console.log('Fayl yuklandi:', file.originalname);

    return this.submissionsService.submitAnswer(userId, file, comment, assignmentId);
  }

  @Get('file/:submissionId')
  async getFile(@Param('submissionId', ParseIntPipe) submissionId: number, @Res() res: Response) {
    const { stream, fileName, contentType } = await this.submissionsService.getSubmissionFile(submissionId);

    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Content-Type', contentType);
    stream.pipe(res);
  }

  @Get('download/:submissionId')
  async downloadFile(@Param('submissionId', ParseIntPipe) submissionId: number, @Res() res: Response) {
    const { stream, fileName, contentType } = await this.submissionsService.getSubmissionFile(submissionId);

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`); // Yuklab olish uchun
    res.setHeader('Content-Type', contentType);
    stream.pipe(res);
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
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @Body() gradeSubmissionDto: GradeSubmissionDto,
  ) {
    if (!req.user || !req.user.id) throw new ForbiddenException('User not authenticated');
    return this.submissionsService.gradeSubmission(req.user.id, submissionId, gradeSubmissionDto);
  }

  @Roles('teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @Get('lesson/:lessonId')
  async getLessonSubmissions(@Req() req, @Param('lessonId', ParseIntPipe) lessonId: number) {
    if (!req.user || !req.user.id) throw new ForbiddenException('User not authenticated');
    return this.submissionsService.getLessonSubmissions(req.user.id, lessonId);
  }

  @UseGuards(AuthGuard)
  @Get('daily-grades/:groupId')
  async getDailyGrades(@Req() req, @Param('groupId', ParseIntPipe) groupId: number) {
    if (!req.user || !req.user.id) throw new ForbiddenException('User not authenticated');
    return this.submissionsService.getDailyGrades(req.user.id, groupId);
  }

  @UseGuards(AuthGuard)
  @Get('total-scores/:groupId')
  async getTotalScores(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.submissionsService.getTotalScores(groupId);
  }

  @Roles('teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @Get('lesson/:lessonId/status/:status')
  async getLessonSubmissionsByStatus(
    @Req() req,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Param('status') status: SubmissionStatus,
  ) {
    if (!req.user || !req.user.id) throw new ForbiddenException('User not authenticated');
    return this.submissionsService.getLessonSubmissionsByStatus(req.user.id, lessonId, status);
  }

  @Roles('teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @Get(':assignmentId/unsubmitted')
  async getUnsubmittedStudents(@Param('assignmentId', ParseIntPipe) assignmentId: number) {
    return this.submissionsService.getUnsubmittedStudents(assignmentId);
  }

  @Delete(':submissionId')
  async deleteSubmission(@Param('submissionId', ParseIntPipe) submissionId: number) {
    return this.submissionsService.deleteSubmission(submissionId);
  }
}