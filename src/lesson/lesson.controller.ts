import { Controller, Get, Post, Body, Param, Put, Delete, Request, UseGuards } from '@nestjs/common';
import { LessonsService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard, Roles, RolesGuard } from '../auth/auth.guard';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @UseGuards(AuthGuard)
  @Get("all")
  async getAll(@Request() req: any) {
    const userId = req.user.id;
    return this.lessonsService.getAll(userId);
  }

  @UseGuards(AuthGuard)
  @Get('group/:groupId')
  async findLessonsByGroup(
    @Param('groupId') groupId: number,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.lessonsService.findLessonsByGroup(groupId, userId);
  }

  @Roles("teacher")
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  async create(
    @Body() lessonData: CreateLessonDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.lessonsService.create(userId, lessonData);
  }

  @Roles("teacher")
  @UseGuards(AuthGuard, RolesGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const lessonId = Number(id);
    return this.lessonsService.update(lessonId, updateLessonDto, userId);
  }

  
  @Roles("teacher")
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    const lessonId = Number(id);
    return this.lessonsService.remove(lessonId, userId);
  }
}
