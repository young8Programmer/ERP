import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Course } from 'src/courses/entities/course.entity';
import { Group } from 'src/groups/entities/group.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  // Talaba yaratish
  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const course = await this.courseRepository.findOne({
      where: { id: createStudentDto.courseId },
      relations: ['groups'],
    });

    if (!course) {
      throw new NotFoundException(`ID ${createStudentDto.courseId} bo‘yicha kurs topilmadi`);
    }

    const validGroupIds = course.groups.map((group) => group.id);
    const invalidGroups = createStudentDto.groupIds.filter((id) => !validGroupIds.includes(id));

    if (invalidGroups.length > 0) {
      throw new Error(`Quyidagi guruhlar kursga tegishli emas: ${invalidGroups.join(', ')}`);
    }

    const groups = await this.groupRepository.findByIds(createStudentDto.groupIds);

    const student = this.studentRepository.create({
      ...createStudentDto,
      groups,
    });

    return await this.studentRepository.save(student);
  }

  // Barcha talabalarni olish
  async findAll(): Promise<Student[]> {
    const students = await this.studentRepository.find({
      relations: ['groups', 'groups.course'],
    });

    if (students.length === 0) {
      throw new NotFoundException('Hech qanday talaba topilmadi');
    }

    return students;
  }

  // ID bo'yicha talabani olish
  async findOne(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['groups', 'groups.course'],
    });

    if (!student) {
      throw new NotFoundException(`ID ${id} bo‘yicha talaba topilmadi`);
    }

    return student;
  }

  // Talabani yangilash
  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);

    if (updateStudentDto.courseId) {
      const course = await this.courseRepository.findOne({
        where: { id: updateStudentDto.courseId },
        relations: ['groups'],
      });

      if (!course) {
        throw new NotFoundException(`ID ${updateStudentDto.courseId} bo‘yicha kurs topilmadi`);
      }

      if (updateStudentDto.groupIds) {
        const validGroupIds = course.groups.map((group) => group.id);
        const invalidGroups = updateStudentDto.groupIds.filter((id) => !validGroupIds.includes(id));

        if (invalidGroups.length > 0) {
          throw new Error(`Quyidagi guruhlar kursga tegishli emas: ${invalidGroups.join(', ')}`);
        }

        const groups = await this.groupRepository.findByIds(updateStudentDto.groupIds);
        student.groups = groups;
      }
    }

    Object.assign(student, updateStudentDto);

    return await this.studentRepository.save(student);
  }

  // Talabani o'chirish
  async remove(id: number): Promise<{ message: string }> {
    const student = await this.studentRepository.findOne({ where: { id } });

    if (!student) {
      throw new NotFoundException(`ID ${id} bo‘yicha talaba topilmadi`);
    }

    await this.studentRepository.remove(student);
    return { message: `ID ${id} bo‘yicha talaba o'chirildi` };
  }
}
