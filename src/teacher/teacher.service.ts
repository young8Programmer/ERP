import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { User } from 'src/students/entities/user.entity';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly userRepository: Repository<User>
  ) {}

  // Teacher yaratish
  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    const teacher = this.userRepository.create(createTeacherDto);
    return this.userRepository.save(teacher);
  }

  // Teacherlarni olish
  async findAll(): Promise<Teacher[]> {
    return this.userRepository.find();
  }

  // Teacherni o'chirish
  async remove(id: string): Promise<void> {
    const teacher = await this.userRepository.findOne({
      where: { id }, // IDni `where` orqali ko'rsatish kerak
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    await this.userRepository.remove(teacher);
  }

  // Teacherni yangilash
  async update(
    id: string,
    user: any,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<Teacher> {
    const teacher = await this.userRepository.findOne({
      where: { id }, // IDni `where` orqali ko'rsatish kerak
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Admin yoki o'zi bo'lgan teacher faqat yangilash mumkin
    if (user.role !== 'admin' && user.id !== teacher.id) {
      throw new ForbiddenException(
        'You do not have permission to update this teacher',
      );
    }

    Object.assign(teacher, updateTeacherDto);
    return this.userRepository.save(teacher);
  }
}

