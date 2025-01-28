import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { CreateProfileDto } from './dto/create.profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Student } from '../students/entities/student.entity';
import { Admin } from '../admin/entities/admin.entity';
import { Teacher } from '../teacher/entities/teacher.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,

    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  async createProfile(createProfileDto: CreateProfileDto): Promise<any> {
    const { studentId, adminId, teacherId } = createProfileDto;

    let profileEntity = null;
    
    if (studentId) {
      const student = await this.studentRepository.findOne({ where: { id: studentId } });
      if (!student) {
        throw new NotFoundException(`Student with ID ${studentId} not found`);
      }
      profileEntity = { student };
    }

    if (adminId) {
      const admin = await this.adminRepository.findOne({ where: { id: adminId } });
      if (!admin) {
        throw new NotFoundException(`Admin with ID ${adminId} not found`);
      }
      profileEntity = { admin };
    }

    if (teacherId) {
      const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
      if (!teacher) {
        throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
      }
      profileEntity = { teacher };
    }

    const profile = this.profileRepository.create({ ...createProfileDto, ...profileEntity });
    return this.profileRepository.save(profile);
  }

  async getAllProfiles(): Promise<Profile[]> {
    return this.profileRepository.find({ relations: ['student', 'admin', 'teacher'] });
  }

  async getProfileById(id: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { id }, relations: ['student', 'admin', 'teacher'] });
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    return profile;
  }

  async updateProfile(id: number, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
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

  async getMyProfile(username: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: [
        { student: { username } },
        { admin: { username } },
        { teacher: { username } },
      ],
      relations: ['student', 'admin', 'teacher'],
    });
  
    if (!profile) {
      throw new NotFoundException(`Profile not found`);
    }
  
    return profile;
  }
  
  
}
