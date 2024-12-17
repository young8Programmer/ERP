import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { User } from 'src/students/entities/user.entity';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(User)
    private readonly teacherRepository: Repository<User>, // Faqat `User` bilan ishlaydi
  ) {}

  // Teacher yaratish
  async create(createTeacherDto: CreateTeacherDto): Promise<User> {
    const teacher = this.teacherRepository.create({
      ...createTeacherDto,
      role: 'teacher', // Rolni aniq belgilash
    });
    return this.teacherRepository.save(teacher);
  }

  // Teacherlarni olish
  async findAll(): Promise<User[]> {
    return this.teacherRepository.find({
      where: { role: 'teacher' }, // Faqat teacherlarni qaytaradi
    });
  }

  // Teacherni o'chirish
  async remove(id: number): Promise<void> {
    const teacher = await this.teacherRepository.findOne({
      where: { id, role: 'teacher' }, // Faqat teacherlarni qidiradi
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    await this.teacherRepository.remove(teacher);
  }

  // Teacherni yangilash
  async update(
    id: number,
    user: any,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<User> {
    const teacher = await this.teacherRepository.findOne({
      where: { id, role: 'teacher' }, // Faqat teacherlarni qidiradi
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Admin yoki o'zini yangilash huquqi
    if (user.role !== 'admin' && user.id !== teacher.id) {
      throw new ForbiddenException(
        'You do not have permission to update this teacher',
      );
    }

    Object.assign(teacher, updateTeacherDto);
    return this.teacherRepository.save(teacher);
  }
}
