import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import * as bcrypt from 'bcrypt';
import { Profile } from 'src/profile/entities/profile.entity';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async createTeacher(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    const existingTeacher = await this.teacherRepository.findOne({ where: { phone: createTeacherDto.phone } });
    if (existingTeacher) {
      throw new NotFoundException(`O'qituvchi telefon raqami ${createTeacherDto.phone} allaqachon mavjud`);
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(createTeacherDto.password, 10);

    // Create teacher
    const teacher = this.teacherRepository.create({
      ...createTeacherDto,
      password: hashedPassword,
    });

    
    const profile = this.profileRepository.create({
      firstName: createTeacherDto.firstName,
      lastName: createTeacherDto.lastName,
      username: createTeacherDto.username,
      password: createTeacherDto.password,
      phone: createTeacherDto.phone
    });

    await this.profileRepository.save(profile);

    return teacher;
  }


  async getAllTeachers(): Promise<Teacher[]> {
    const teachers = await this.teacherRepository.find({ relations: ['groups'] });
    if (teachers.length === 0) {
      throw new NotFoundException('Hech qanday o‘qituvchi topilmadi');
    }
    return teachers;
  }

  async getTeacherById(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({ where: { id }, relations: ['groups'] });
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
