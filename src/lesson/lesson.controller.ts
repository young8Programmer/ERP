import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  NotFoundException,
  UnauthorizedException,
  ParseIntPipe, // ParseIntPipe ni import qilish
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { LessonsService } from './lesson.service';
import { GroupsService } from 'src/groups/group.service'; // GroupsService ni import qilish
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { RolesTeacherGuard } from 'src/auth/rolesTeacherGuard';
import { Roles } from 'src/auth/roles.guard';

@Controller('lessons')
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly groupsService: GroupsService, // GroupsService ni dependency sifatida olish
  ) {}

  // Guruhdagi darsliklarni ko'rish
  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Get(':groupId')
  async getLessons(
    @Param('groupId', ParseIntPipe) groupId: number, // groupId ni raqamga aylantirish
    @Request() req,
  ) {
    const teacherId = req.user.id;
    const group = await this.groupsService.findOne(groupId);

    if (!group || group.teacherId !== teacherId) {
      throw new UnauthorizedException(
        'Siz bu guruhdagi darsliklarni ko‘rish huquqiga ega emassiz',
      );
    }

    const lessons = await this.lessonsService.findByGroupId(groupId);
    return {
      message: 'Darsliklar muvaffaqiyatli olindi',
      lessons,
    };
  }

  // Darslik yaratish
  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Post(':groupId')
  async createLesson(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() createLessonDto: CreateLessonDto,
    @Request() req,
  ) {
    const teacherId = req.user.id; // O'quvchi ID sini olish
    const group = await this.groupsService.findOne(groupId);

    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }

    // Guruhni faqat o'quvchi boshqarishiga ruxsat berish
    if (group.teacherId !== teacherId) {
      throw new UnauthorizedException(
        'Siz bu guruhda darslik yaratish huquqiga ega emassiz',
      );
    }

    const lesson = await this.lessonsService.create(groupId, createLessonDto);
    return {
      message: 'Darslik muvaffaqiyatli yaratildi',
      lesson,
    };
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Put(':lessonId')
  async updateLesson(
    @Param('lessonId', ParseIntPipe) lessonId: number, // lessonId ni raqamga aylantirish
    @Body() updateLessonDto: UpdateLessonDto,
    @Request() req,
  ) {
    const teacherId = req.user.id;
    const lesson = await this.lessonsService.findOne(lessonId);

    if (!lesson) {
      throw new NotFoundException('Darslik topilmadi');
    }

    const group = await this.groupsService.findOne(lesson.groupId);

    if (!group || group.teacherId !== teacherId) {
      throw new UnauthorizedException(
        'Siz bu darslikni boshqarish huquqiga ega emassiz',
      );
    }

    const updatedLesson = await this.lessonsService.update(
      lessonId,
      updateLessonDto,
    );
    return {
      message: 'Darslik muvaffaqiyatli yangilandi',
      lesson: updatedLesson,
    };
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Delete(':lessonId')
  async removeLesson(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Request() req,
  ) {
    const teacherId = req.user.id;
    const lesson = await this.lessonsService.findOne(lessonId);

    if (!lesson) {
      throw new NotFoundException('Darslik topilmadi');
    }

    const group = await this.groupsService.findOne(lesson.groupId);

    if (!group || group.teacherId !== teacherId) {
      throw new UnauthorizedException(
        'Siz bu darslikni o‘chirish huquqiga ega emassiz',
      );
    }

    await this.lessonsService.remove(lessonId);
    return {
      message: 'Darslik muvaffaqiyatli o‘chirildi',
    };
  }
}
