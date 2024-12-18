import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // Foydalanuvchi modelini inject qildik
  ) {}

  async createProfile(createProfileDto: CreateProfileDto): Promise<Profile> {
    const { userId } = createProfileDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const profile = this.profileRepository.create({ ...createProfileDto, user });
    return this.profileRepository.save(profile);
  }

  async getAllProfiles(): Promise<Profile[]> {
    return this.profileRepository.find({ relations: ['user'] });
  }

  async getProfileById(id: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { id }, relations: ['user'] });
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    return profile;
  }

  async updateProfile(id: number, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    // Profilni topamiz
    const profile = await this.profileRepository.findOne({ where: { id } });
  
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
  
    // Agar `userId` berilgan bo‘lsa, foydalanuvchini tekshiramiz
    if (updateProfileDto.userId) {
      const user = await this.userRepository.findOne({ where: { id: updateProfileDto.userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${updateProfileDto.userId} not found`);
      }
  
      // User IDni qo'shamiz (bog‘lanish uchun)
      profile.user = { id: updateProfileDto.userId } as any; // Bu yerda faqat ID qo‘llanadi
    }
  
    // Qolgan ma'lumotlarni yangilash
    Object.assign(profile, updateProfileDto);
  
    return this.profileRepository.save(profile);
  }
  

  
  async deleteProfile(id: number): Promise<void> {
    const profile = await this.getProfileById(id);
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    await this.profileRepository.remove(profile);
  }
}
