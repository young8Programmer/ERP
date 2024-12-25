import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Group } from '../groups/entities/group.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
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

  async createStudent(createStudentDto: CreateStudentDto): Promise<Student> {
    const { phone, groupId } = createStudentDto;

    const existingStudent = await this.studentRepository.findOne({
      where: { phone },
    });
    if (existingStudent) {
      throw new Error(
        `Ushbu telefon raqami bilan talaba avval qo‘shilgan: ${phone}`,
      );
    }

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['course'],
    });
    if (!group) {
      throw new NotFoundException(`ID ${groupId} bo‘yicha guruh topilmadi`);
    }

    const student = this.studentRepository.create({
      ...createStudentDto,
      groups: [group],
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
