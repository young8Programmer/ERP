import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LessonsService } from './lesson.service';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesTeacherGuard } from 'src/auth/rolesTeacherGuard';
import { Roles } from 'src/auth/roles.guard';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Get()
  async findAll(@Req() req) {
    const teacherId = req.user?.id;
    if (!teacherId) {
      throw new HttpException(
        'Foydalanuvchi maʼlumotlari topilmadi',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const lessons = await this.lessonsService.findAllByTeacher(teacherId);
    return { message: 'Barcha darslar muvaffaqiyatli olingan.', lessons };
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Post()
  async create(
    @Body() lessonData: { title: string; groupId: number },
    @Req() req,
  ) {
    const teacherId = req.user?.id;
    if (!teacherId) {
      throw new HttpException(
        'Foydalanuvchi maʼlumotlari topilmadi',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const createdLesson = await this.lessonsService.create(
      lessonData,
      teacherId,
    );
    return {
      message: 'Dars muvaffaqiyatli yaratildi.',
      lesson: createdLesson,
    };
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @Req() req,
  ) {
    const teacherId = req.user?.id;
    if (!teacherId) {
      throw new HttpException(
        'Foydalanuvchi maʼlumotlari topilmadi',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const updatedLesson = await this.lessonsService.update(
      id,
      updateLessonDto,
      teacherId,
    );
    if (!updatedLesson) {
      throw new NotFoundException(`Dars topilmadi (ID: ${id})`);
    }
    return {
      message: 'Dars muvaffaqiyatli yangilandi.',
      lesson: updatedLesson,
    };
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const teacherId = req.user?.id;
    if (!teacherId) {
      throw new HttpException(
        'Foydalanuvchi maʼlumotlari topilmadi',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.lessonsService.remove(id, teacherId);
    return { message: `Dars muvaffaqiyatli o'chirildi (ID: ${id})` };
  }
}
