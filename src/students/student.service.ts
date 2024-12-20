import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Group } from 'src/groups/entities/group.entity';
import { Course } from 'src/courses/entities/course.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  // Talaba yaratish
  async createStudent(createStudentDto: CreateStudentDto): Promise<Student> {
    const { firstName, lastName, phone, address, courseId, groupId } =
      createStudentDto;

    // Telefon raqami bo'yicha mavjud talabani tekshirish
    const existingStudent = await this.studentRepository.findOne({
      where: { phone },
    });
    if (existingStudent) {
      throw new Error(
        `Ushbu telefon raqami bilan talaba avval qo‘shilgan: ${phone}`,
      );
    }

    // Kurs mavjudligini tekshirish
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`ID ${courseId} bo‘yicha kurs topilmadi`);
    }

    // Guruh mavjudligini tekshirish
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException(`ID ${groupId} bo‘yicha guruh topilmadi`);
    }

    // Talabani yaratish
    const student = this.studentRepository.create({
      firstName,
      lastName,
      phone,
      address,
    });

    // Kursni va guruhni bog‘lash
    student.course = course;
    student.groups = [group];

    // Talabani saqlash
    return await this.studentRepository.save(student);
  }

  // Barcha talabalarni olish
  async getAllStudents(): Promise<Student[]> {
    const students = await this.studentRepository.find({
      relations: ['groups', 'course'],
    });
    if (students.length === 0) {
      throw new NotFoundException('Hech qanday talaba topilmadi');
    }
    return students;
  }

  // Talabani ID bo'yicha olish
  async getStudentById(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['groups', 'course'],
    });
    if (!student) {
      throw new NotFoundException(`ID ${id} bo‘yicha talaba topilmadi`);
    }
    return student;
  }

  // Talabani yangilash
  async updateStudent(
    id: number,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const { courseId, groupId } = updateStudentDto;

    // Talabani tekshirish
    const student = await this.getStudentById(id);

    // Agar kurs ID ko'rsatilgan bo'lsa, tekshirish
    if (courseId) {
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
      });
      if (!course) {
        throw new NotFoundException(`ID ${courseId} bo‘yicha kurs topilmadi`);
      }
      student.course = course;
    }

    // Agar guruh ID ko'rsatilgan bo'lsa, tekshirish
    if (groupId) {
      const group = await this.groupRepository.findOne({
        where: { id: groupId },
      });
      if (!group) {
        throw new NotFoundException(`ID ${groupId} bo‘yicha guruh topilmadi`);
      }
      student.groups = [group];
    }

    Object.assign(student, updateStudentDto);
    return await this.studentRepository.save(student);
  }

  // Talabani o'chirish
  async deleteStudent(id: number): Promise<void> {
    const student = await this.getStudentById(id);
    await this.studentRepository.remove(student);
  }
}
