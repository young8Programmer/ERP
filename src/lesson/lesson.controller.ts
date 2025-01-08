import { Controller, Get, Post, Body, Put, Param, Delete, NotFoundException, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
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
  async findAll() {
    try {
      const lessons = await this.lessonsService.findAll();
      return { message: 'Barcha darslar muvaffaqiyatli olingan.', lessons };
    } catch (error) {
      throw new HttpException(
        'Barcha darslarni olishda xatolik yuz berdi',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Post()
  async create(@Body() lessonData: { title: string; groupId: number }) {
    try {
      const existingLesson = await this.lessonsService.findOneByTitle(lessonData.title);
      if (existingLesson) {
        throw new HttpException(
          'Bunday dars allaqachon mavjud.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const createdLesson = await this.lessonsService.create(lessonData);
      return {
        message: 'Dars muvaffaqiyatli yaratildi.',
        lesson: createdLesson,
      };
    } catch (error) {
      throw new HttpException(
        'Darsni yaratishda xatolik yuz berdi: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    try {
      const updatedLesson = await this.lessonsService.update(id, updateLessonDto);
      if (!updatedLesson) {
        throw new HttpException(
          `Dars topilmadi (ID: ${id})`,
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        message: 'Dars muvaffaqiyatli yangilandi.',
        lesson: updatedLesson,
      };
    } catch (error) {
      throw new HttpException(
        'Darsni yangilashda xatolik yuz berdi',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.lessonsService.remove(id);
      return { message: `Dars muvaffaqiyatli o'chirildi (ID: ${id})` };
    } catch (error) {
      throw new HttpException(
        "Darsni o'chirishda xatolik yuz berdi",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
