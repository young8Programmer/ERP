import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, UseInterceptors, UploadedFile, NotFoundException, Res, ParseIntPipe } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AuthGuard, Roles, RolesGuard } from 'src/auth/auth.guard';
import { CreateAssignmentDto } from './dto/create-assignment.dto';  // Import qilish
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}
  
  @Roles('teacher')
@UseGuards(AuthGuard, RolesGuard)
@Post()
@UseInterceptors(FileInterceptor('file'))
async create(
  @Req() req,
  @UploadedFile() file: any, // Fayl obyektini olish
  @Body() createAssignmentDto: CreateAssignmentDto
) {
  const teacherId = req.user.id;
  const lesson_id = parseInt(createAssignmentDto.lesson_id as any, 10);
  const group_id = parseInt(createAssignmentDto.group_id as any, 10);

  return this.assignmentsService.createAssignment(teacherId, {
    ...createAssignmentDto,
    lesson_id,
    group_id,
  }, file);
}

@Get('file/:assignmentId')
async getAssignmentFile(@Param('assignmentId', ParseIntPipe) assignmentId: number, @Res() res: Response) {
  const assignment = await this.assignmentsService.getAssignmentFile(assignmentId);

  if (!assignment || !assignment.fileData) {
    throw new NotFoundException('Fayl topilmadi');
  }

  res.setHeader('Content-Type', assignment.fileType);
  res.setHeader('Content-Disposition', `attachment; filename=${assignment.fileName}`);
  res.send(assignment.fileData);
}

  
  @Roles('teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('teacher')
  @Put(':id')
  async updateAssignment(@Req() req, @Param('id') id: string, @Body() updateData: any) {
    const teacherId = req.user.id; 
    return this.assignmentsService.updateAssignment(teacherId, +id, updateData);
  }

  
  @Roles('teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const teacherId = req.user.id;
    return this.assignmentsService.remove(teacherId, +id);
  }

  @UseGuards(AuthGuard)
  @Get('lesson/:lessonId')
  async findAssignmentsForUser(@Req() req, @Param('lessonId') lessonId: string) {
    const userId = req.user.id; 
    const role = req.user.role; 

    return this.assignmentsService.findAssignmentsForUser(+lessonId, userId, role);
  }

}
