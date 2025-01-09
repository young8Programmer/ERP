import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  private lessons = []; // Oddiy massiv orqali darsliklarni saqlaymiz

  // Guruhdagi barcha darsliklarni olish
  async findByGroupId(groupId: number) {
    // Guruhga tegishli barcha darsliklarni qaytaradi
    const groupLessons = this.lessons.filter(
      (lesson) => lesson.groupId === groupId,
    );
    if (groupLessons.length === 0) {
      throw new NotFoundException(
        `Guruhga tegishli darsliklar topilmadi (groupId: ${groupId})`,
      );
    }
    return groupLessons;
  }

  // Bitta darslikni ID bo'yicha topish
  async findOne(lessonId: number) {
    // ID bo‘yicha darsni topadi
    const lesson = this.lessons.find((lesson) => lesson.id === lessonId);
    if (!lesson) {
      throw new NotFoundException(`Darslik topilmadi (ID: ${lessonId})`);
    }
    return lesson;
  }

  // Yangi darslik yaratish
  async create(groupId: number, createLessonDto: CreateLessonDto) {
    const newLesson = {
      id: this.lessons.length
        ? Math.max(...this.lessons.map((lesson) => lesson.id)) + 1
        : 1,
      ...createLessonDto,
      groupId, // Guruhni saqlash
    };

    // Yangi darslikni saqlash
    this.lessons.push(newLesson);
    return newLesson;
  }

  // Darslikni yangilash
  async update(lessonId: number, updateLessonDto: UpdateLessonDto) {
    const lessonIndex = this.lessons.findIndex(
      (lesson) => lesson.id === lessonId,
    );
    if (lessonIndex === -1) {
      throw new NotFoundException(`Darslik topilmadi (ID: ${lessonId})`);
    }

    const updatedLesson = {
      ...this.lessons[lessonIndex],
      ...updateLessonDto,
    };

    // Yangilangan darslikni o'zgartirish
    this.lessons[lessonIndex] = updatedLesson;

    return updatedLesson;
  }

  // Darslikni o'chirish
  async remove(lessonId: number) {
    const lessonIndex = this.lessons.findIndex(
      (lesson) => lesson.id === lessonId,
    );
    if (lessonIndex === -1) {
      throw new NotFoundException(`Darslik topilmadi (ID: ${lessonId})`);
    }

    // O'chirilgan darslikni qaytarish
    const removedLesson = this.lessons.splice(lessonIndex, 1);
    return removedLesson[0]; // Bir nechta darsliklar o'chirilsa ham, faqat birinchi elementni qaytarish
  }
}
