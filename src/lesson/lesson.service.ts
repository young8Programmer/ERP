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

  async findLessonsByGroup(groupId: number, userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    const group = await this.groupRepository.findOne({
      where: { id: groupId }
    });
  
    if (!group) {
      throw new NotFoundException('Group not found');
    }
  
    // O'qituvchi bo'lsa, faqat o'ziga biriktirilgan guruhda darsliklarni ko'rishi mumkin
    if (user.teacherId) {
      if (group.teacher.id !== user.teacherId) {
        throw new ForbiddenException('You can only view lessons from your own group');
      }
    }
  
    // Talaba bo'lsa, faqat o'zi biriktirilgan guruhda darsliklarni ko'rishi mumkin
    if (user.studentId) {
      const isStudentInGroup = group.students.some(student => student.id === user.studentId);
      if (!isStudentInGroup) {
        throw new ForbiddenException('You can only view lessons from your own group');
      }
    }
  
    return group.lessons;
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
