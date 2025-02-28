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
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB chegarasi
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(pdf|doc|docx|jpg|jpeg|png)$/)) {
          return cb(new Error('Faqat PDF, DOC, JPG yoki PNG fayllar qo‘llab-quvvatlanadi'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Req() req, // Foydalanuvchi ma’lumotlari uchun (token’dan teacherId olish)
    @UploadedFile() file: any, // Yuklanadigan fayl
    @Body() createAssignmentDto: CreateAssignmentDto, // DTO’dan kelgan ma’lumotlar
  ) {
    const teacherId = req.user.id; // AuthGuard’dan kelgan foydalanuvchi ID’si
    return this.assignmentsService.createAssignment(teacherId, createAssignmentDto, file);
  }

  @Get('file/:assignmentId') // GET /assignments/file/:assignmentId
  async getAssignmentFile(
    @Param('assignmentId', ParseIntPipe) assignmentId: number, // assignmentId ni number’ga aylantirish
    @Res() res: Response, // Faylni response sifatida qaytarish uchun
  ) {
    const { fileData, fileName, contentType } = await this.assignmentsService.getAssignmentFile(assignmentId);

    if (!fileData) {
      throw new NotFoundException('Fayl topilmadi');
    }

    // Faylni brauzerda ochish uchun response sozlamalari
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`); // Inline — faylni ochish uchun
    res.send(fileData);
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
