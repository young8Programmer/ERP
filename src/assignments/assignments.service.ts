// All required imports
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { Lesson } from 'src/lesson/entities/lesson.entity';
import { User } from '../auth/entities/user.entity';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Create assignment
  async create(
    teacherId: number, // Token orqali olingan o'qituvchi ID
    assignmentData: { group_id: number; lesson_id: number; assignment: string },
  ) {
    // O'qituvchi o'ziga tegishli guruhni tekshiradi
    const lesson = await this.lessonRepository.findOne({
      where: { id: assignmentData.lesson_id },
      relations: ['group', 'group.teacher'],
    });

    if (!lesson || lesson.group.teacher.id !== teacherId) {
      throw new ForbiddenException(
        'Siz faqat o\'zingizga tegishli guruhga topshiriq qo\'shishingiz mumkin',
      );
    }

    const assignment = this.assignmentRepository.create({
      assignment: assignmentData.assignment,
      lesson,
    });

    return this.assignmentRepository.save(assignment);
  }

  // Update assignment
  async updateAssignment(
    teacherId: number,
    assignmentId: number,
    updateData: { assignment?: string; status?: string },
  ) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['lesson', 'lesson.group', 'lesson.group.teacher'],
    });

    if (!assignment) {
      throw new NotFoundException(
        `Assignment with ID ${assignmentId} not found`,
      );
    }

    if (assignment.lesson.group.teacher.id !== teacherId) {
      throw new ForbiddenException(
        'Siz faqat o\'zingizga tegishli guruhdagi topshiriqni o\'zgartira olasiz',
      );
    }

    if (updateData.assignment) {
      assignment.assignment = updateData.assignment;
    }
    if (updateData.status) {
      assignment.status = updateData.status;
    }

    return this.assignmentRepository.save(assignment);
  }

  // Delete assignment
  async remove(teacherId: number, assignmentId: number) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['lesson', 'lesson.group', 'lesson.group.teacher'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }

    if (assignment.lesson.group.teacher.id !== teacherId) {
      throw new ForbiddenException(
        'Siz faqat o\'zingizga tegishli guruhdagi topshiriqni o\'chira olasiz',
      );
    }

    await this.assignmentRepository.remove(assignment);
    return { message: 'Topshiriq muvaffaqiyatli o\'chirildi' };
  }
}
