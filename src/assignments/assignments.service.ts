import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { Repository } from 'typeorm';
import { Lesson } from 'src/lesson/entities/lesson.entity';
import { User } from 'src/auth/entities/user.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

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

  async createAssignment(teacherId: number, createAssignmentDto: CreateAssignmentDto) {
    const { lesson_id, assignment } = createAssignmentDto;

    const lesson = await this.lessonRepository.findOne({
      where: { id: lesson_id },
      relations: ['group', 'group.teacher'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lesson_id} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: teacherId } });

    if (!user || lesson.group.teacher.id !== user.teacherId) {
      throw new ForbiddenException('Siz faqat o\'zingizga tegishli guruhdagi topshiriqni yaratishingiz mumkin');
    }

    const newAssignment = this.assignmentRepository.create({
      lesson,
      assignment,
      status: 'pending',
    });

    await this.assignmentRepository.save(newAssignment);

    return { message: 'Assignment successfully created', assignmentId: newAssignment.id };
  }

  async updateAssignment(teacherId: number, assignmentId: number, updateData: { assignment?: string; status?: string }) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['lesson', 'lesson.group', 'lesson.group.teacher'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: teacherId } });

    if (!user || assignment.lesson.group.teacher.id !== user.teacherId) {
      throw new ForbiddenException('Siz faqat o\'zingizga tegishli guruhdagi topshiriqni o\'zgartira olasiz');
    }

    if (updateData.assignment) {
      assignment.assignment = updateData.assignment;
    }
    if (updateData.status) {
      assignment.status = updateData.status;
    }

    await this.assignmentRepository.save(assignment);

    return { message: 'Assignment successfully updated' };
  }

  async remove(teacherId: number, assignmentId: number) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['lesson', 'lesson.group', 'lesson.group.teacher'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: teacherId } });

    if (!user || assignment.lesson.group.teacher.id !== user.teacherId) {
      throw new ForbiddenException('Siz faqat o\'zingizga tegishli guruhdagi topshiriqni o\'chira olasiz');
    }

    await this.assignmentRepository.remove(assignment);

    return { message: 'Assignment successfully removed' };
  }
}
