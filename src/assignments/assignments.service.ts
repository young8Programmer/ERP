import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { Repository } from 'typeorm';
import { Lesson } from 'src/lesson/entities/lesson.entity';
import { Teacher } from 'src/teacher/entities/teacher.entity';
import { Student } from '../students/entities/student.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>, 
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>, 
  ) {}

  async createAssignment(teacherId: number, createAssignmentDto: CreateAssignmentDto, file: any) {
    const { lesson_id, title, description, dueDate } = createAssignmentDto;
  
    const lesson = await this.lessonRepository.findOne({
      where: { id: lesson_id },
      relations: ['group', 'group.teacher'],
    });
  
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lesson_id} not found`);
    }
  
    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
  
    if (lesson.group.teacher.id !== teacher.id) {
      throw new ForbiddenException('Siz faqat o‘zingizga tegishli guruhdagi topshiriqni yaratishingiz mumkin');
    }
  
    // **Faylni tekshirish**
    if (!file || !file.buffer) {
      throw new BadRequestException('Fayl yuklanmagan yoki noto‘g‘ri');
    }
  
    const newAssignment = this.assignmentRepository.create({
      lesson,
      title,
      description,
      fileData: file.buffer, // Faylni buffer sifatida saqlash
      fileName: file.originalname,
      fileType: file.mimetype, // Fayl turi
      status: 'pending',
      dueDate: dueDate ? new Date(dueDate) : null,
    });
  
    await this.assignmentRepository.save(newAssignment);
  
    return { message: 'Assignment successfully created', assignmentId: newAssignment.id };
  }
  
  async getAssignmentFile(assignmentId: number) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      select: ['fileData', 'fileName', 'fileType'],
    });
  
    if (!assignment || !assignment.fileData) {
      throw new NotFoundException('Fayl topilmadi');
    }
  
    return {
      fileData: assignment.fileData,
      fileName: assignment.fileName,
      fileType: assignment.fileType,
    };
  }
  
  
  async updateAssignment(teacherId: number, assignmentId: number, updateData: Partial<CreateAssignmentDto>) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['lesson', 'lesson.group', 'lesson.group.teacher'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }

    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });

    if (!teacher || assignment.lesson.group.teacher.id !== teacher.id) {
      throw new ForbiddenException('Siz faqat o\'zingizga tegishli guruhdagi topshiriqni o\'zgartira olasiz');
    }

    Object.assign(assignment, updateData);

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

    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });

    if (!teacher || assignment.lesson.group.teacher.id !== teacher.id) {
      throw new ForbiddenException('Siz faqat o\'zingizga tegishli guruhdagi topshiriqni o\'chira olasiz');
    }

    await this.assignmentRepository.remove(assignment);

    return { message: 'Assignment successfully removed' };
  }

  async findAssignmentsForUser(lessonId: number, userId: number, role: 'teacher' | 'student') {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['group', 'group.teacher', 'group.students'], 
    });
  
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }
  
    if (role === 'teacher') {
      const teacher = await this.teacherRepository.findOne({ where: { id: userId } });
      
      if (!teacher || lesson.group.teacher.id !== teacher.id) {
        throw new ForbiddenException('Siz faqat o\'zingizga tegishli guruhdagi topshiriqlarni ko\'ra olasiz');
      }
    }
  
    if (role === 'student') {
      const student = await this.studentRepository.findOne({ where: { id: userId } });
  
      if (!student || !lesson.group.students.some((s) => s.id === student.id)) {
        throw new ForbiddenException('Siz ushbu guruhga tegishli darslarni ko\'ra olmaysiz');
      }
    }
  
    const assignments = await this.assignmentRepository.find({
      where: { lesson: { id: lessonId } }, 
      relations: ["submissions"]
    });
  
    if (!assignments || assignments.length === 0) {
      throw new NotFoundException('No assignments found for this lesson');
    }
  
    return assignments;
  }
}
