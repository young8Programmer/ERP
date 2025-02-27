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
    const { phone, username, password, firstName, lastName, address } = createTeacherDto;
  
    // Telefon raqami mavjudligini tekshirish
    const existingTeacher = await this.teacherRepository.findOne({
      where: { phone },
    });
    if (existingTeacher) {
      throw new NotFoundException(`O'qituvchi telefon raqami ${phone} allaqachon mavjud`);
    }
  
    // Foydalanuvchi nomi mavjudligini tekshirish
    const existingUsername = await this.teacherRepository.findOne({
      where: { username },
    });
    if (existingUsername) {
      throw new NotFoundException(`Ushbu foydalanuvchi nomi allaqachon mavjud: ${username}`);
    }
  
    // Parolni hash qilish
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Profile yaratish va saqlash
    const profile = this.profileRepository.create({
      firstName,
      lastName,
      username,
      password: hashedPassword, // Hashlangan parol
      phone,
      address,
    });
    await this.profileRepository.save(profile);
  
    // O'qituvchi yaratish va profile bilan bog'lash
    const teacher = this.teacherRepository.create({
      ...createTeacherDto,
      password: hashedPassword, // Hashlangan parol
      profile, // Bog'lanayotgan profil
    });
  
    return await this.teacherRepository.save(teacher);
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
