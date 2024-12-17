import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createStudent(createStudentDto: CreateStudentDto) {
    const existingStudent = await this.userRepository.findOne({ where: { username: createStudentDto.username, role: 'student' } });
    if (existingStudent) {
      throw new ConflictException('A student with this username already exists.');
    }

    const student = this.userRepository.create({
      ...createStudentDto,
      role: 'student',
    });
    return this.userRepository.save(student);
  }

  async findAll() {
    const students = await this.userRepository.find({ where: { role: 'student' } });
    if (!students.length) {
      throw new NotFoundException('No students found.');
    }
    return students;
  }

  async findOne(id: number) {
    const student = await this.userRepository.findOne({ where: { id, role: 'student' } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found.`);
    }
    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    const student = await this.userRepository.findOne({ where: { id, role: 'student' } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found.`);
    }

    const usernameConflict = await this.userRepository.findOne({ where: { username: updateStudentDto.username, id: Not(id) } });
    if (usernameConflict) {
      throw new ConflictException('A student with this username already exists.');
    }

    await this.userRepository.update(id, updateStudentDto);
    return this.userRepository.findOne({ where: { id, role: 'student' } });
  }

  async remove(id: number) {
    const student = await this.userRepository.findOne({ where: { id, role: 'student' } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found.`);
    }

    const result = await this.userRepository.delete(id);
    return { success: result.affected > 0 };
  }
}
