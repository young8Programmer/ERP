import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from '../students/entities/user.entity';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Admin yaratish
  async createAdmin(createAdminDto: CreateAdminDto) {
    const existingUser = await this.userRepository.findOne({
      where: { username: createAdminDto.username },
    });
    if (existingUser) {
      throw new ConflictException('A user with this username already exists.');
    }

    const admin = this.userRepository.create({
      ...createAdminDto,
      role: 'admin',
    });
    return this.userRepository.save(admin);
  }

  // Barcha adminlarni olish
  async findAll() {
    return this.userRepository.find({ where: { role: 'admin' } });
  }

  // Adminni ID bo‘yicha olish
  async findOne(id: number) {
    const admin = await this.userRepository.findOne({ where: { id, role: 'admin' } });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found.`);
    }
    return admin;
  }

  // Adminni yangilash
  async update(id: number, updateAdminDto: Partial<CreateAdminDto>) {
    const admin = await this.userRepository.findOne({ where: { id, role: 'admin' } });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found.`);
    }

    const usernameConflict = await this.userRepository.findOne({
      where: { username: updateAdminDto.username, id: Not(id) },
    });
    if (usernameConflict) {
      throw new ConflictException('An admin with this username already exists.');
    }

    Object.assign(admin, updateAdminDto);
    return this.userRepository.save(admin);
  }

  // Adminni o'chirish
  async remove(id: number) {
    const admin = await this.userRepository.findOne({ where: { id, role: 'admin' } });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found.`);
    }

    await this.userRepository.remove(admin);
    return { success: true, message: `Admin with ID ${id} has been removed.` };
  }
}
