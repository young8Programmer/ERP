import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Group } from '../groups/entities/group.entity';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async findAll() {
    const lessons = await this.lessonRepository.find();

    // Ma'lumotlarni kerakli formatga o'zgartirish
    return {
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        name: lesson.title,
        description: `Dars ${lesson.id} haqida batafsil ma'lumot.`,
      })),
    };
  }
  

  async create(lessonData: { title: string; groupId: number }) {
    const group = await this.groupRepository.findOne({
      where: { id: lessonData.groupId },
    });
    if (!group) throw new Error('Group not found');

    const lesson = this.lessonRepository.create({
      title: lessonData.title,
      group,
    });
    return this.lessonRepository.save(lesson);
  }

  // Update Lesson by ID (converting id to number)
  async update(id: string, updateLessonDto: UpdateLessonDto) {
    const lessonId = Number(id); // Convert string id to number
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    // Darsni yangilash
    const updatedLesson = await this.lessonRepository.save({
      ...lesson,
      ...updateLessonDto,
    });
    return updatedLesson;
  }

  // Delete Lesson by ID (converting id to number)
  async remove(id: string) {
    const lessonId = Number(id); // Convert string id to number
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    // Darsni o'chirish
    await this.lessonRepository.delete(lessonId);
    return { message: `Lesson with ID ${id} successfully deleted` };
  }
}
