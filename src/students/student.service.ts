import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async createStudent(createStudentDto: CreateStudentDto): Promise<Student> {
    const existingStudent = await this.studentRepository.findOne({ where: { phone: createStudentDto.phone } });
    if (existingStudent) {
      throw new Error(`Ushbu telefon raqami bilan talaba avval qo‘shilgan: ${createStudentDto.phone}`);
    }
    const student = this.studentRepository.create(createStudentDto);
    return await this.studentRepository.save(student);
  }

  async getAllStudents(): Promise<Student[]> {
    const students = await this.studentRepository.find({ relations: ['groups'] });
    if (students.length === 0) {
      throw new NotFoundException('Hech qanday talaba topilmadi');
    }
    return students;
  }

  async getStudentById(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({ where: { id }, relations: ['groups'] });
    if (!student) {
      throw new NotFoundException(`ID ${id} bo‘yicha talaba topilmadi`);
    }
    return student;
  }

  async updateStudent(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.getStudentById(id);
    if (!student) {
      throw new NotFoundException(`ID ${id} bo‘yicha talaba topilmadi`);
    }
    Object.assign(student, updateStudentDto);
    return await this.studentRepository.save(student);
  }

  async deleteStudent(id: number): Promise<void> {
    const student = await this.getStudentById(id);
    if (!student) {
      throw new NotFoundException(`ID ${id} bo‘yicha talaba topilmadi`);
    }
    await this.studentRepository.remove(student);
  }
}
