import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { Roles } from 'src/auth/roles.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesStudentGuard } from 'src/auth/rolesStudentGuard';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @UseGuards(AuthGuard, RolesStudentGuard)
  @Roles('student')
  @Post('submit')
  async submitAssignment(@Body() createSubmissionDto: CreateSubmissionDto) {
    try {
      const submission =
        await this.submissionsService.submitAssignment(createSubmissionDto);
      return { message: 'Topshiriq muvaffaqiyatli topshirildi.', submission };
    } catch (error) {
      throw new Error('Topshiriqni topshirishda xatolik yuz berdi');
    }
  }
}
