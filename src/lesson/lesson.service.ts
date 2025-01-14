import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Group } from '../groups/entities/group.entity';
import { User } from 'src/auth/entities/user.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  async getAll(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    return this.lessonRepository.find({relations: ["group", "assignments"]});
  }

  async findLessonsByGroup(groupId: number, userId: number) {

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['teacher', 'students']
    });

    if (!group) throw new NotFoundException('Guruh topilmadi');
    const isTeacher = group.teacher.id === user.teacherId;
    const isStudent = group.students.some(student => student.id === user.studentId)

    if (!isTeacher && !isStudent) {
      throw new ForbiddenException("Siz faqat o'zingizning guruhingizdagi darslarni ko'rishingiz mumkin");
    }

    return this.lessonRepository.find({
      where: { group: { id: groupId } },
    });
  }

  async create(userId: number, lessonData: CreateLessonDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User topilmadi');
  
    const group = await this.groupRepository.findOne({
      where: { id: lessonData.groupId },
      relations: ['teacher', 'students'],
    });
    if (!group) throw new NotFoundException('Group topilmadi');
  
    if (group.teacher?.id !== user.teacherId) {
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
