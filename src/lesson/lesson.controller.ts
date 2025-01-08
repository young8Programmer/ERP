import { Controller, Get, Post, Body, Put, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
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
      throw new Error('Barcha darslarni olishda xatolik yuz berdi');
    }
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
@Roles('teacher')
@Post()
async create(@Body() lessonData: { title: string; groupId: number }) {
  try {

    const existingLesson = await this.lessonsService.findOneByTitle(lessonData.title);
    if (existingLesson) {
      throw new Error('Bunday dars allaqachon mavjud.');
    }
    
    const createdLesson = await this.lessonsService.create(lessonData);
    return {
      message: 'Dars muvaffaqiyatli yaratildi.',
      lesson: createdLesson,
    };
  } catch (error) {
    throw new Error('Darsni yaratishda xatolik yuz berdi: ' + error.message);
  }
}


  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    try {
      const updatedLesson = await this.lessonsService.update(
        id,
        updateLessonDto,
      );
      if (!updatedLesson) {
        throw new NotFoundException(`Dars topilmadi (ID: ${id})`);
      }
      return {
        message: 'Dars muvaffaqiyatli yangilandi.',
        lesson: updatedLesson,
      };
    } catch (error) {
      throw new Error('Darsni yangilashda xatolik yuz berdi');
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
      throw new Error("Darsni o'chirishda xatolik yuz berdi");
    }
  }
}


