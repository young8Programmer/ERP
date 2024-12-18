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
    const { name, courseId, teacherId, students } = createGroupDto;
  
    // Kursni tekshirish
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new BadRequestException('Course not found');
    }
  
    // O'qituvchini tekshirish
    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }
  
    // Talabalar ro'yxatini tekshirish
    if (students.length === 0) {
      throw new BadRequestException('Students not found');
    }
  
    const studentEntities = await this.studentRepository.findByIds(students);
  
    // Guruh mavjudligini tekshirish
    const existingGroup = await this.groupRepository.findOne({ where: { name }, relations: ['course', 'teacher', 'students'] });
    if (existingGroup) {
      throw new BadRequestException('Group with this name already exists');
    }
  
    const group = this.groupRepository.create({
      name,
      course,
      teacher,
      students: studentEntities,
    });
  
    return this.groupRepository.save(group);
  }
  
  async getAllGroups(): Promise<Group[]> {
    return this.groupRepository.find({ relations: ['course', 'teacher', 'students'] });
  }

  async getGroupById(id: number): Promise<Group> {
    const group = await this.groupRepository.findOne({ where: { id }, relations: ['course', 'teacher', 'students'] });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  async updateGroup(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.getGroupById(id);
  
    if (updateGroupDto.name) {
      group.name = updateGroupDto.name;
    }
  
    if (updateGroupDto.courseId) {
      const course = await this.courseRepository.findOne({ where: { id: updateGroupDto.courseId } });
      if (!course) {
        throw new BadRequestException('Course not found');
      }
      group.course = course;
    }
  
    if (updateGroupDto.teacherId) {
      const teacher = await this.teacherRepository.findOne({ where: { id: updateGroupDto.teacherId } });
      if (!teacher) {
        throw new BadRequestException('Teacher not found');
      }
      group.teacher = teacher;
    }
  
    if (updateGroupDto.students) {
      const studentEntities = await this.studentRepository.findByIds(updateGroupDto.students);
      group.students = studentEntities;
    }
  
    // Tekshirish: Yangi yangilangan guruh mavjudmi
    const existingGroup = await this.groupRepository.findOne({ where: { name: group.name }, relations: ['course', 'teacher', 'students'] });
    if (existingGroup && existingGroup.id !== id) {
      throw new BadRequestException('Group with this name already exists');
    }
  
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
