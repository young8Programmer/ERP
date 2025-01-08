import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { Lesson } from 'src/lesson/entities/lesson.entity';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  // All assignments
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

  // Get single assignment by ID
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

  // Create assignment
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

  // Update assignment
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

  async remove(id: number) {
    try {
      const assignment = await this.assignmentRepository.findOne({
        where: { id },
      });

      if (!assignment) {
        throw new Error(`Topshiriq topilmadi (ID: ${id})`);
      }

      // Submission yozuvlarini tekshirib, o'chirish
      const submissions = await this.lessonRepository.find({
        where: { assignment: { id } },
      });

      if (submissions.length > 0) {
        // Agar submission mavjud bo'lsa, ularni o'chirish
        await this.lessonRepository.remove(submissions);
      }

      // Assignmentni o'chirish
      await this.assignmentRepository.delete(id);
      return { message: "Topshiriq muvaffaqiyatli o'chirildi." };
    } catch (error) {
      console.error('Xatolik:', error.message);
      throw new Error("Topshiriqni o'chirishda xatolik yuz berdi");
    }
  }
}
