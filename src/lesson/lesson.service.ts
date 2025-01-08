import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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

  // Faqat o'zi a'zo bo'lgan guruhdagi darslarni olish
  async findAllByTeacher(teacherId: number) {
    const groups = await this.groupRepository.find({
      where: { teacherId },
      relations: ['lessons'],
    });

    const lessons = groups.flatMap((group) => group.lessons);

    return {
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        name: lesson.title,
        description: `Dars ${lesson.id} haqida batafsil ma'lumot.`,
      })),
    };
  }

  // Faqat o'zi a'zo bo'lgan guruhda dars yaratish
  async create(
    lessonData: { title: string; groupId: number },
    teacherId: number,
  ) {
    const group = await this.groupRepository.findOne({
      where: { id: lessonData.groupId, teacherId },
    });
    if (!group)
      throw new ForbiddenException("Bu guruhda dars yaratishga ruxsat yo'q.");

    const lesson = this.lessonRepository.create({
      title: lessonData.title,
      group,
    });
    return this.lessonRepository.save(lesson);
  }

  // Faqat o'zi a'zo bo'lgan guruhdagi darsni yangilash
  async update(
    id: string,
    updateLessonDto: UpdateLessonDto,
    teacherId: number,
  ) {
    const lessonId = Number(id); // IDni raqamga o'zgartirish
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['group'],
    });

    if (!lesson || lesson.group.teacherId !== teacherId) {
      throw new ForbiddenException("Bu darsni yangilashga ruxsat yo'q.");
    }

    const updatedLesson = await this.lessonRepository.save({
      ...lesson,
      ...updateLessonDto,
    });
    return updatedLesson;
  }

  // Faqat o'zi a'zo bo'lgan guruhdagi darsni o'chirish
  async remove(id: string, teacherId: number) {
    const lessonId = Number(id); // IDni raqamga o'zgartirish
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['group'],
    });

    if (!lesson || lesson.group.teacherId !== teacherId) {
      throw new ForbiddenException("Bu darsni o'chirishga ruxsat yo'q.");
    }

    await this.lessonRepository.delete(lessonId);
    return { message: `Lesson with ID ${id} successfully deleted` };
  }
}
