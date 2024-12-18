import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Course } from '../courses/entities/course.entity';
import { Student } from '../students/entities/user.entity';
import { Teacher } from '../teacher/entities/teacher.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  async createGroup(createGroupDto: CreateGroupDto): Promise<Group> {
    const { name, courses, students, teachers } = createGroupDto;

    // Tekshirish: Agar kurslar, talabalar yoki o'qituvchilar mavjud bo'lsa, yaratishga urinmaslik
    if (courses.length === 0 || students.length === 0 || teachers.length === 0) {
      throw new BadRequestException('Courses, students, or teachers not found');
    }

    const courseEntities = await this.courseRepository.findByIds(courses);
    const studentEntities = await this.studentRepository.findByIds(students);
    const teacherEntities = await this.teacherRepository.findByIds(teachers);

    // Tekshirish: Guruh avvalroq mavjudmi
    const existingGroup = await this.groupRepository.findOne({ where: { name }, relations: ['courses', 'students', 'teachers'] });
    if (existingGroup) {
      throw new BadRequestException('Group with this name already exists');
    }

    const group = this.groupRepository.create({
      name,
      courses: courseEntities,
      students: studentEntities,
      teachers: teacherEntities,
    });

    return this.groupRepository.save(group);
  }

  async getAllGroups(): Promise<Group[]> {
    return this.groupRepository.find({ relations: ['courses', 'students', 'teachers'] });
  }

  async getGroupById(id: number): Promise<Group> {
    const group = await this.groupRepository.findOne({ where: { id }, relations: ['courses', 'students', 'teachers'] });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  async updateGroup(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.getGroupById(id);

    if (updateGroupDto.courses) {
      const courseEntities = await this.courseRepository.findByIds(updateGroupDto.courses);
      group.courses = courseEntities;
    }

    if (updateGroupDto.students) {
      const studentEntities = await this.studentRepository.findByIds(updateGroupDto.students);
      group.students = studentEntities;
    }

    if (updateGroupDto.teachers) {
      const teacherEntities = await this.teacherRepository.findByIds(updateGroupDto.teachers);
      group.teachers = teacherEntities;
    }

    // Tekshirish: Yangi yangilangan guruh mavjudmi
    const existingGroup = await this.groupRepository.findOne({ where: { name: group.name }, relations: ['courses', 'students', 'teachers'] });
    if (existingGroup && existingGroup.id !== id) {
      throw new BadRequestException('Group with this name already exists');
    }

    Object.assign(group, updateGroupDto);
    return this.groupRepository.save(group);
  }

  async deleteGroup(id: number): Promise<void> {
    const group = await this.getGroupById(id);
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    await this.groupRepository.remove(group);
  }
}
