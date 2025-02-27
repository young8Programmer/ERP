import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Group } from '../groups/entities/group.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { Teacher } from 'src/teacher/entities/teacher.entity';
import { Student } from 'src/students/entities/student.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Teacher)  // teacherRepository
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Student)  // studentRepository
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  // Foydalanuvchi ma'lumotlarini topish
  private async getUserById(userId: number): Promise<Teacher | Student> {
    const user = await this.teacherRepository.findOne({ where: { id: userId } })
      || await this.studentRepository.findOne({ where: { id: userId } })

    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return user;
  }

  // Barcha darslarni olish
  async getAll(userId: number) {
    await this.getUserById(userId); // Foydalanuvchi tekshiriladi
    return this.lessonRepository.find({ relations: ["group", "assignments"] });
  }

  // Guruh bo'yicha darslarni olish
  async findLessonsByGroup(groupId: number, userId: number) {
    const user = await this.getUserById(userId); // Foydalanuvchi tekshiriladi

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['teacher', 'students']
    });

    if (!group) throw new NotFoundException('Guruh topilmadi');

    const isTeacher = group.teacher.id === user.id;
    const isStudent = group.students.some(student => student.id === user.id);

    if (!isTeacher && !isStudent) {
      throw new ForbiddenException("Siz faqat o'zingizning guruhingizdagi darslarni ko'rishingiz mumkin");
    }

    return this.lessonRepository.find({
      where: { group: { id: groupId } },
    });
  }

  // Yangi dars yaratish
  async create(userId: number, lessonData: CreateLessonDto) {
    const user = await this.getUserById(userId); // Foydalanuvchi tekshiriladi

    const group = await this.groupRepository.findOne({
      where: { id: lessonData.groupId },
      relations: ['teacher', 'students'],
    });

    if (!group) throw new NotFoundException('Group topilmadi');

    if (group.teacher?.id !== user.id) {
      throw new ForbiddenException('Siz bu darsni guruhiga ulanmagansiz');
    }

    const lesson = this.lessonRepository.create({
      lessonName: lessonData.lessonName,
      lessonNumber: lessonData.lessonNumber,
      lessonDate: new Date(),
      endDate: lessonData.endDate ? new Date(lessonData.endDate) : null,
      group,
    });

    const savedLesson = await this.lessonRepository.save(lesson);

    for (const attendanceData of lessonData.attendance) {
      const student = group.students.find((s) => s.id === attendanceData.studentId);
      if (!student) {
        throw new NotFoundException(`Student with ID ${attendanceData.studentId} not found in group`);
      }

      const attendance = this.attendanceRepository.create({
        lesson: savedLesson,
        student,
        status: attendanceData.status,
      });
      await this.attendanceRepository.save(attendance);
    }

    return savedLesson;
  }

  // Darsni yangilash
  async update(id: number, updateLessonDto: any, userId: number) {
    const user = await this.getUserById(userId); // Foydalanuvchi tekshiriladi

    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['group', 'group.teacher'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    if (lesson.group.teacher?.id !== user.id) {
      throw new ForbiddenException('You can only update lessons in your own group');
    }

    const updatedLesson = await this.lessonRepository.save({
      ...lesson,
      ...updateLessonDto,
    });
    return updatedLesson;
  }

  // Darsni o'chirish
  async remove(id: number, userId: number) {
    const user = await this.getUserById(userId); // Foydalanuvchi tekshiriladi

    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['group', 'group.teacher'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    if (lesson.group.teacher?.id !== user.id) {
      throw new ForbiddenException('You can only delete lessons from your own group');
    }

    await this.lessonRepository.delete(id);
    return { message: `Lesson with ID ${id} successfully deleted` };
  }
}
