import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Body,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from '../auth/auth.guard';
import { Roles } from '../auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Roles('teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async create(
    @Req() req,
    @UploadedFile() file: any,
    @Body() createAssignmentDto: CreateAssignmentDto,
  ) {
    const teacherId = req.user.id;

    if (!file) {
      throw new ForbiddenException('Fayl noto‘g‘ri yuklangan yoki yo‘q');
    }

    return this.assignmentsService.createAssignment(teacherId, createAssignmentDto, file);
  }

  @Get('file/:assignmentId')
  async getAssignmentFile(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Res() res: Response,
  ) {
    const { stream, fileName, contentType } = await this.assignmentsService.getAssignmentFile(assignmentId);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    stream.pipe(res);
  }

  @Get('download/:assignmentId')
  async downloadAssignmentFile(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Res() res: Response,
  ) {
    const { stream, fileName, contentType } = await this.assignmentsService.getAssignmentFile(assignmentId);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`); // Yuklab olish uchun
    stream.pipe(res);
  }

  @Roles('teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @Put(':assignmentId')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async update(
    @Req() req,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Body() updateAssignmentDto: Partial<CreateAssignmentDto>,
    @UploadedFile() file?: any,
  ) {
    const teacherId = req.user.id;
    return this.assignmentsService.updateAssignment(teacherId, assignmentId, updateAssignmentDto, file);
  }

  @Roles('teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':assignmentId')
  async remove(
    @Req() req,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
  ) {
    const teacherId = req.user.id;
    return this.assignmentsService.remove(teacherId, assignmentId);
  }

  @UseGuards(AuthGuard)
  @Get('lesson/:lessonId')
  async findAssignmentsForUser(
    @Req() req,
    @Param('lessonId', ParseIntPipe) lessonId: number,
  ) {
    const userId = req.user.id;
    const role = req.user.role;
    return this.assignmentsService.findAssignmentsForUser(lessonId, userId, role);
  }
}