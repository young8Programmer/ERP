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
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { SubmissionService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { GradeSubmissionDto } from './dto/GradeSubmissionDto';
import { AuthGuard, Roles, RolesGuard } from 'src/auth/auth.guard';
import { SubmissionStatus } from './entities/submission.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';
import * as fs from "fs";
import * as path from "path";

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionsService: SubmissionService) {}

  @Post(':assignmentId/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/submissions',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(
    @Req() req,
    @Param('assignmentId') assignmentId: number,
    @UploadedFile() file: any,
    @Body('comment') comment: string,
  ) {
    if (!file) {
      throw new ForbiddenException('Fayl yuklanmadi');
    }

    return this.submissionsService.submitAnswer(req.user.id, file.filename, comment, assignmentId);
  }

  @Get('file/:filename')
  async getFile(@Param('filename') filename: string) {
    const filePath = path.join(__dirname, '..', '..', 'uploads', 'submissions', filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Fayl topilmadi');
    }
    return { filePath };
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
