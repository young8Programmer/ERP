import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Group } from '../groups/entities/group.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  
  // Guruhga tegishli darslarni olish
  async findLessonsByGroup(groupId: number, userId: number) {
    // Foydalanuvchi malumotlarini olish
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    // Guruhni olish va tekshirish
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['teacher', 'students'], // Guruhning o'qituvchisini va talabalari
    });

    if (!group) throw new NotFoundException('Guruh topilmadi');

    // Foydalanuvchi roli va guruhga tegishliligini tekshirish
    const isTeacher = group.teacher.id === user.teacherId;
    const isStudent = group.students.some(student => student.id === user.studentId); // studentId orqali tekshirish

    if (!isTeacher && !isStudent) {
      throw new ForbiddenException('Siz faqat o\'zingizning guruhingizdagi darslarni ko\'rishingiz mumkin');
    }

    return this.lessonRepository.find({
      where: { group: { id: groupId } },
    });
  }

  async create(userId: number, lessonData: { title: string; groupId: number }) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const group = await this.groupRepository.findOne({
      where: { id: lessonData.groupId },
      relations: ['teacher'],
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // O'qituvchi faqat o'z guruhida dars yaratishi mumkin
    if (group.teacher?.id !== user.teacherId) {
      throw new ForbiddenException('You can only create lessons in your own group');
    }

    const existingLesson = await this.lessonRepository.findOne({
      where: { title: lessonData.title, group: { id: lessonData.groupId } },
    });
    if (existingLesson) {
      throw new ForbiddenException('Lesson already exists');
    }

    const lesson = this.lessonRepository.create({
      title: lessonData.title,
      group,
    });
    return this.lessonRepository.save(lesson);
  }

  async update(id: number, updateLessonDto: any, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['group', 'group.teacher'],
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    // O'qituvchi faqat o'z guruhidagi darsni yangilay oladi
    if (lesson.group.teacher?.id !== user.teacherId) {
      throw new ForbiddenException('You can only update lessons in your own group');
    }

    const updatedLesson = await this.lessonRepository.save({
      ...lesson,
      ...updateLessonDto,
    });
    return updatedLesson;
  }

  async remove(id: number, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['group', 'group.teacher'],
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    // O'qituvchi faqat o'z guruhidagi darsni o'chirishi mumkin
    if (lesson.group.teacher?.id !== user.teacherId) {
      throw new ForbiddenException('You can only delete lessons from your own group');
    }

    await this.lessonRepository.delete(id);
    return { message: `Lesson with ID ${id} successfully deleted` };
  }
}
