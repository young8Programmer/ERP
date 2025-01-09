import { Controller, Get, Post, Body, Param, Put, Delete, Request, UseGuards } from '@nestjs/common';
import { LessonsService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesTeacherGuard } from '../auth/rolesTeacherGuard';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @UseGuards(AuthGuard)
  @Get('group/:groupId')
  async findLessonsByGroup(
    @Param('groupId') groupId: string,
    @Request() req: any,
  ) {
    return this.lessonsService.findLessonsByGroup(Number(groupId), req.user.id);
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Post()
  async create(@Body() lessonData: CreateLessonDto, @Request() req: any) {
    return this.lessonsService.create(req.user.id, lessonData);
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @Request() req: any,
  ) {
    return this.lessonsService.update(Number(id), updateLessonDto, req.user.id);
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.lessonsService.remove(Number(id), req.user.id);
  }
}
