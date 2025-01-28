import { Injectable, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Student } from 'src/students/entities/student.entity';
import { Teacher } from '../teacher/entities/teacher.entity'
import { Lesson } from 'src/lesson/entities/lesson.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>
  ) {}

  // Student uchun attendance qo'shish
  async create(createAttendanceDto: CreateAttendanceDto, studentId: number) {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new ForbiddenException('Student not found');
    }

    const lesson = await this.lessonRepository.findOne({ where: { id: createAttendanceDto.studentId } });
    if (!lesson) {
      throw new ForbiddenException('Lesson not found');
    }

    const attendance = this.attendanceRepository.create({
      student,
      lesson,
      status: createAttendanceDto.status,
    });

    await this.attendanceRepository.save(attendance);

    return { message: 'Attendance marked successfully', attendance };
  }

  // Teacher uchun attendance qo'shish
  async markTeacherAttendance(createAttendanceDto: CreateAttendanceDto, teacherId: number) {
    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
    if (!teacher) {
      throw new ForbiddenException('Teacher not found');
    }

    const lesson = await this.lessonRepository.findOne({ where: { id: createAttendanceDto.studentId } });
    if (!lesson) {
      throw new ForbiddenException('Lesson not found');
    }

    const attendance = this.attendanceRepository.create({
      lesson,
      status: createAttendanceDto.status,
    });

    await this.attendanceRepository.save(attendance);

    return { message: 'Teacher attendance marked successfully', attendance };
  }

  findAll() {
    return this.attendanceRepository.find();
  }

  findOne(id: number) {
    return this.attendanceRepository.findOne({ where: { id } });
  }

  update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceRepository.update(id, updateAttendanceDto);
  }

  remove(id: number) {
    return this.attendanceRepository.delete(id);
  }
}
