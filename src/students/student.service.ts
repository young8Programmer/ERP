import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Group } from '../groups/entities/group.entity';
import * as bcrypt from 'bcrypt';
import { Profile } from 'src/profile/entities/profile.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async getAllStudents(): Promise<Student[]> {
    const students = await this.studentRepository.find({
      relations: ['groups', 'groups.course'],
    });
    if (students.length === 0) {
      throw new NotFoundException('Hech qanday talaba topilmadi');
    }
    return students;
  }

  async getStudentById(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['groups', 'groups.course'],
    });
    if (!student) {
      throw new NotFoundException(`ID ${id} bo‘yicha talaba topilmadi`);
    }
    return student;
  }

  async searchStudents(name: string): Promise<Student[]> {
    const students = await this.studentRepository.find({
      where: [
        { firstName: ILike(`%${name}%`) },
        { lastName: ILike(`%${name}%`) },
      ],
      relations: ['groups', 'groups.course'],
    });

    if (students.length === 0) {
      throw new NotFoundException(`"${name}" bo‘yicha talaba topilmadi`);
    }
    return students;
  }

  async createStudent(createStudentDto: CreateStudentDto): Promise<Student> {
    const { phone, username, password, groupId } = createStudentDto;
  
    // Telefon raqami mavjudligini tekshirish
    const existingStudent = await this.studentRepository.findOne({ where: { phone } });
    if (existingStudent) {
      throw new NotFoundException(`Ushbu telefon raqami bilan talaba avval qo‘shilgan: ${phone}`);
    }
  
    // Foydalanuvchi nomi mavjudligini tekshirish
    const existingUsername = await this.studentRepository.findOne({ where: { username } });
    if (existingUsername) {
      throw new NotFoundException(`Ushbu foydalanuvchi nomi mavjud: ${username}`);
    }
  
    // Parolni hash qilish
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Guruhni topish
    const group = await this.groupRepository.findOne({ where: { id: groupId }, relations: ['course'] });
    if (!group) {
      throw new NotFoundException(`ID ${groupId} bo‘yicha guruh topilmadi`);
    }
  
    // Profile yaratish
    const profile = this.profileRepository.create({
      firstName: createStudentDto.firstName,
      lastName: createStudentDto.lastName,
      username,
      password: hashedPassword,
      phone,
      address: createStudentDto.address,
    });
  
    // Profileni saqlash
    const savedProfile = await this.profileRepository.save(profile);
  
    // Talabani yaratish va Profile bilan bog'lash
    const student = this.studentRepository.create({
      ...createStudentDto,
      password: hashedPassword, // Hashlangan parolni saqlaymiz
      profile: savedProfile, // Profileni bog'laymiz
      groups: [group], // Guruhni bog'laymiz
    });
  
    return await this.studentRepository.save(student);
  }
  
  async updateStudent(
    id: number,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const student = await this.getStudentById(id);

    const { groupId } = updateStudentDto;
    if (groupId) {
      const group = await this.groupRepository.findOne({
        where: { id: groupId },
        relations: ['course'],
      });
      if (!group) {
        throw new NotFoundException(`ID ${groupId} bo‘yicha guruh topilmadi`);
      }
      student.groups = [group];
    }

    Object.assign(student, updateStudentDto);
    return await this.studentRepository.save(student);
  }

  async deleteStudent(id: number): Promise<void> {
    const student = await this.getStudentById(id);
    if (!student) {
      throw new NotFoundException(`ID ${id} bo‘yicha talaba topilmadi`);
    }
    await this.studentRepository.remove(student);
  }
}
