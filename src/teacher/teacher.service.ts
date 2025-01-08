import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  async createTeacher(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    const existingTeacher = await this.teacherRepository.findOne({ where: { phone: createTeacherDto.phone } });
    if (existingTeacher) {
      throw new NotFoundException(`O'qituvchi telefon raqami ${createTeacherDto.phone} allaqachon mavjud`);
    }
    const teacher = this.teacherRepository.create(createTeacherDto);
    return await this.teacherRepository.save(teacher);
  }

  async getAllTeachers(): Promise<Teacher[]> {
    const teachers = await this.teacherRepository.find({ relations: ['groups', "users"] });
    if (teachers.length === 0) {
      throw new NotFoundException('Hech qanday o‘qituvchi topilmadi');
    }
    return teachers;
  }

  async getTeacherById(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({ where: { id }, relations: ['groups', "users"] });
    if (!teacher) {
      throw new NotFoundException(`O'qituvchi ID ${id} topilmadi`);
    }
    return teacher;
  }

  async updateTeacher(id: number, updateTeacherDto: UpdateTeacherDto): Promise<Teacher> {
    const teacher = await this.getTeacherById(id);
    if (!teacher) {
      throw new NotFoundException(`O'qituvchi ID ${id} topilmadi`);
    }
    Object.assign(teacher, updateTeacherDto);
    return await this.teacherRepository.save(teacher);
  }

  async deleteTeacher(id: number): Promise<void> {
    const teacher = await this.getTeacherById(id);
    if (!teacher) {
      throw new NotFoundException(`O'qituvchi ID ${id} topilmadi`);
    }
    await this.teacherRepository.remove(teacher);
  }
}
