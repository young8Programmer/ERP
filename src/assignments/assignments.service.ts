import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { Lesson } from 'src/lesson/entities/lesson.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  // Barcha topshiriqlar
  async findAll() {
    const assignments = await this.assignmentRepository.find({
      relations: ['lesson', 'lesson.group'],
    });

    return assignments.map((assignment) => ({
      group_id: assignment.lesson.group.id,
      lesson_id: assignment.lesson.id,
      assignment: assignment.assignment,
    }));
  }

  // Topshiriq ID bo'yicha olish
  async getAssignmentById(assignmentId: number) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['lesson', 'lesson.group'],
    });

    if (!assignment) {
      throw new NotFoundException(
        `Assignment with ID ${assignmentId} not found`,
      );
    }

    return {
      group_id: assignment.lesson.group.id,
      lesson_id: assignment.lesson.id,
      assignment: assignment.assignment,
    };
  }

  // Topshiriq yaratish
  async create(assignmentData: {
    group_id: number;
    lesson_id: number;
    assignment: string;
  }) {
    const lesson = await this.lessonRepository.findOne({
      where: { id: assignmentData.lesson_id },
      relations: ['group'],
    });

    if (!lesson || lesson.group.id !== assignmentData.group_id) {
      throw new Error('Lesson or Group not found or mismatch');
    }

    const assignment = this.assignmentRepository.create({
      assignment: assignmentData.assignment,
      lesson,
    });

    return this.assignmentRepository.save(assignment);
  }

  // Topshiriqni yangilash
  async updateAssignment(
    assignmentId: number,
    updateData: { assignment?: string; status?: string },
  ) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Assignment with ID ${assignmentId} not found`,
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

  // Topshiriqni o'chirish
  async remove(id: number) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    await this.assignmentRepository.remove(assignment);
    return { message: 'Assignment successfully deleted' };
  }
}
