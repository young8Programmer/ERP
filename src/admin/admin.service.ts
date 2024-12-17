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

  async createAdmin(createAdminDto: CreateAdminDto) {
    const existingAdmin = await this.userRepository.findOne({ where: { username: createAdminDto.username, role: 'admin' } });
    if (existingAdmin) {
      throw new ConflictException('An admin with this username already exists.');
    }

    const admin = this.userRepository.create({
      ...createAdminDto,
      role: 'admin',
    });
    return this.userRepository.save(admin);
  }

  async findAll() {
    const admins = await this.userRepository.find({ where: { role: 'admin' } });
    if (!admins.length) {
      throw new NotFoundException('No admins found.');
    }
    return admins;
  }

  async findOne(id: number) {
    const admin = await this.userRepository.findOne({ where: { id, role: 'admin' } });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found.`);
    }
    return admin;
  }

  async update(id: number, updateAdminDto: CreateAdminDto) {
    const admin = await this.userRepository.findOne({ where: { id, role: 'admin' } });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found.`);
    }

    const usernameConflict = await this.userRepository.findOne({ where: { username: updateAdminDto.username, id: Not(id) } });
    if (usernameConflict) {
      throw new ConflictException('An admin with this username already exists.');
    }

    await this.userRepository.update(id, updateAdminDto);
    return this.userRepository.findOne({ where: { id, role: 'admin' } });
  }

  async remove(id: number) {
    const admin = await this.userRepository.findOne({ where: { id, role: 'admin' } });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found.`);
    }

    const result = await this.userRepository.delete(id);
    return { success: result.affected > 0 };
  }
}
