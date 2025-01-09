import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async createAssignment(
    teacherId: number,
    createAssignmentDto: CreateAssignmentDto,
  ) {
    const { lesson_id, assignment, dueDate } = createAssignmentDto;

    const lesson = await this.lessonRepository.findOne({
      where: { id: lesson_id },
      relations: ['group', 'group.teacher'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lesson_id} not found`);
    }

    const user = await this.userRepository.findOne({
      where: { id: teacherId },
    });

    if (lesson.group.teacher.id !== user.teacherId) {
      throw new ForbiddenException(
        "Siz faqat o'zingizga tegishli guruhdagi topshiriqni yaratishingiz mumkin",
      );
    }

    const existingAssignment = await this.assignmentRepository.findOne({
      where: { lesson: { id: lesson_id }, assignment },
    });

    if (existingAssignment) {
      throw new ForbiddenException(
        'Bu topshiriq ushbu dars uchun allaqachon mavjud',
      );
    }

    let dueDateString = null;
    if (dueDate) {
      const dueDateObj = new Date();
      dueDateObj.setDate(dueDateObj.getDate() + dueDate); // Hozirgi sanaga 'dueDate' kunlar qo‘shiladi
      dueDateString = dueDateObj.toISOString(); // ISO formatida sanani olish
    }

    const newAssignment = this.assignmentRepository.create({
      lesson,
      assignment,
      status: 'pending',
      dueDate: dueDateString, // Yangi dueDate qiymatini saqlash
    });

    await this.assignmentRepository.save(newAssignment);

    return {
      message: 'Assignment successfully created',
      assignmentId: newAssignment.id,
    };
  }

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

    const user = await this.userRepository.findOne({
      where: { id: teacherId },
    });

    if (!user || assignment.lesson.group.teacher.id !== user.teacherId) {
      throw new ForbiddenException(
        "Siz faqat o'zingizga tegishli guruhdagi topshiriqni o'zgartira olasiz",
      );
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
      throw new NotFoundException(
        `Assignment with ID ${assignmentId} not found`,
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: teacherId },
    });

    if (!user || assignment.lesson.group.teacher.id !== user.teacherId) {
      throw new ForbiddenException(
        "Siz faqat o'zingizga tegishli guruhdagi topshiriqni o'chira olasiz",
      );
    }

    await this.assignmentRepository.remove(assignment);

    return { message: 'Assignment successfully removed' };
  }

  async findAssignmentsForUser(
    lessonId: number,
    userId: number,
    role: 'teacher' | 'student',
  ) {
    // Lessonni olish
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['group', 'group.teacher', 'group.students'], // Guruh, o'qituvchi va o'quvchilarni yuklash
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    // Agar role teacher bo'lsa, o'qituvchi uchun tekshiruv
    if (role === 'teacher') {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user || lesson.group.teacher.id !== user.teacherId) {
        throw new ForbiddenException(
          "Siz faqat o'zingizga tegishli guruhdagi topshiriqlarni ko'ra olasiz",
        );
      }
    }

    // Agar role student bo'lsa, student uchun guruhga tegishli ekanligini tekshirish
    if (role === 'student') {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (
        !user ||
        !lesson.group.students.some((student) => student.id === user.studentId)
      ) {
        throw new ForbiddenException(
          "Siz ushbu guruhga tegishli darslarni ko'ra olmaysiz",
        );
      }
    }

    // Ushbu darsga tegishli topshiriqlarni olish
    const assignments = await this.assignmentRepository.find({
      where: { lesson: { id: lessonId } },
    });

    if (!assignments || assignments.length === 0) {
      throw new NotFoundException('No assignments found for this lesson');
    }

    return assignments;
  }
}
