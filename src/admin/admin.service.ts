import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Profile } from 'src/profile/entities/profile.entity';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) {}

  async getAll(): Promise<Admin[]> {
    return this.adminRepository.find();
  }

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    // Username bo'yicha tekshiruv, agar takroriy bo'lsa xato qaytaradi
    const existingAdmin = await this.adminRepository.findOne({
      where: { username: createAdminDto.username },
    });

    if (existingAdmin) {
      throw new ConflictException('Username already exists');
    }

    // Parolni shifrlash
    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10); // 10 - salt rounds

    // Admin entity yaratish
    const admin = this.adminRepository.create({
      ...createAdminDto,
      password: hashedPassword,  // Shifrlangan parolni qo'shamiz
      role: 'admin',  // Role ni avtomatik tarzda qo'shamiz
    });

    // Profile yaratish va shifrlangan parolni qo'shish
    const profile = this.profileRepository.create({
      username: createAdminDto.username,
      password: hashedPassword,
      firstName: createAdminDto.firstName,
      lastName: createAdminDto.lastName,
      phone: createAdminDto.phone,
      address: createAdminDto.address  // Shifrlangan parolni qo'shamiz
    });

    // Profile-ni saqlash
    await this.profileRepository.save(profile);

    // Profile-ni admin bilan bog'lash
    admin.profile = profile;

    // Admin-ni saqlash
    return this.adminRepository.save(admin);
  }

  async update(id: number, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.adminRepository.preload({
      id,
      ...updateAdminDto,
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return this.adminRepository.save(admin);
  }

  async delete(id: number): Promise<void> {
    const result = await this.adminRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
  }
}
