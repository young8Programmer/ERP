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
      assignmentId,
      createSubmissionDto.content,
    );
  }

  // O'qituvchi tomonidan submission baholash
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


  // Talabalarning kunlik baholarini ko'rish
  @UseGuards(AuthGuard)
  @Get('daily-grades')
  async getDailyGrades(@Req() req) {
    const userId = req.user.id; // O'qituvchi yoki adminni tekshirish uchun
    return this.submissionsService.getDailyGrades(userId);
  }

  // Talabalarning jami ballarini kamayish tartibida ko'rish
  @UseGuards(AuthGuard)
  @Get('total-scores')
  async getTotalScores(@Req() req) {
    const userId = req.user.id; // O'qituvchi yoki adminni tekshirish uchun
    return this.submissionsService.getTotalScores(userId);
  }
}
