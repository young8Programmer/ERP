import { Controller, Get, Post, Body, Param, Put, Delete, Request, UseGuards } from '@nestjs/common';
import { LessonsService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesTeacherGuard } from '../auth/rolesTeacherGuard';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  // Guruh bo'yicha darslarni olish
  @UseGuards(AuthGuard)
  @Get('group/:groupId')
  async findLessonsByGroup(
    @Param('groupId') groupId: number,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.lessonsService.findLessonsByGroup(groupId, userId);
  }

  // Dars yaratish (faqat o'qituvchi uchun)
  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Post()
  async create(
    @Body() lessonData: CreateLessonDto,
    @Request() req: any,  // Request obyektini olish
  ) {
    const userId = req.user.id;  // userId token orqali olinadi
    return this.lessonsService.create(userId, lessonData);
  }

  // Darsni yangilash (faqat o'qituvchi uchun)
  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;  // userId token orqali olinadi
    return this.lessonsService.update(id, updateLessonDto, userId);
  }

  // Darsni o'chirish (faqat o'qituvchi uchun)
  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;  // userId token orqali olinadi
    return this.lessonsService.remove(id, userId);
  }
}
