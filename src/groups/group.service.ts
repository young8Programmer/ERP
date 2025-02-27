import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Course } from '../courses/entities/course.entity';
import { Student } from '../students/entities/student.entity';
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
    try {
      const { name, courseId, teacherId, students } = createGroupDto;
  
      // Course tekshiriladi va topiladi
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
        relations: ['groups'], // Groups bilan birga yuklash
      });
      if (!course) throw new BadRequestException('Course not found');
  
      // Teacher tekshiriladi va topiladi
      const teacher = teacherId
        ? await this.teacherRepository.findOne({ where: { id: teacherId } })
        : null;
  
      if (teacherId && !teacher) throw new BadRequestException('Teacher not found');
  
      // Students tekshiriladi va topiladi
      const studentEntities = students
        ? await this.studentRepository.findByIds(students)
        : [];
  
      // Group dublikat bo'lishini tekshirish
      const existingGroup = await this.groupRepository.findOne({
        where: { name, course: { id: courseId } },
      });
  
      if (existingGroup) {
        throw new BadRequestException('Group with the same name already exists for this course');
      }
  
      // Group yaratish
      const group = this.groupRepository.create({
        name,
        course,
        teacher,
        students: studentEntities,
      });
  
      // Groupni saqlash
      const savedGroup = await this.groupRepository.save(group);
  
      // Coursega yangi groupni qo'shish
      course.groups = [...course.groups, savedGroup];
      await this.courseRepository.save(course);
  
      return savedGroup;
    } catch (error) {
      throw new BadRequestException(`Failed to create group: ${error.message}`);
    }
  }
  
  async addStudentToGroup(groupId: number, studentId: number): Promise<Group> {
    try {
      const group = await this.getGroupById(groupId);

      const student = await this.studentRepository.findOne({ where: { id: studentId } });
      if (!student) throw new NotFoundException('Student not found');

      group.students.push(student);
      return this.groupRepository.save(group);
    } catch (error) {
      throw new BadRequestException(`Failed to add student to group: ${error.message}`);
    }
  }

  async getGroupById(id: number): Promise<Group> {
    try {
      const group = await this.groupRepository.findOne({
        where: { id },
        relations: ['course', 'teacher', 'students'],
      });
      if (!group) throw new NotFoundException('Group not found');
      return group;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch group: ${error.message}`);
    }
  }

  async getGroupsByTeacherId(username: string): Promise<Group[]> {
    try {
      const teacher = await this.teacherRepository.findOne({ where: { username } });
      if (!teacher) throw new NotFoundException('Teacher not found');

      return await this.groupRepository.find({
        where: { teacher: { id: teacher.id } },
      });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch groups by teacher ID: ${error.message}`);
    }
  }

  async getGroupsByStudentId(username: string): Promise<Group[]> {
    try {
      const student = await this.studentRepository.findOne({ where: { username } });
      if (!student) throw new NotFoundException('Student not found');

      return await this.groupRepository.find({
        where: { students: { id: student.id } },
        relations: ['students'],
      });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch groups by student ID: ${error.message}`);
    }
  }

  async getStudentGroups(groupId: number): Promise<Student[]> {
    try {
      const group = await this.groupRepository.findOne({
        where: { id: groupId },
        relations: ['students'],
      });
  
      if (!group) throw new NotFoundException('Group not found');
  
      return group.students; // Guruhga tegishli studentlarni qaytaradi
    } catch (error) {
      throw new BadRequestException(`Failed to fetch students in group: ${error.message}`);
    }
  }
  

  async getAllGroupsForAdmin(): Promise<Group[]> {
    try {
      return await this.groupRepository.find({ relations: ['course', 'teacher', 'students'] });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch all groups for admin: ${error.message}`);
    }
  }

  async updateGroup(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    try {
      const group = await this.getGroupById(id);

      if (updateGroupDto.name) group.name = updateGroupDto.name;

      return this.groupRepository.save(group);
    } catch (error) {
      throw new BadRequestException(`Failed to update group: ${error.message}`);
    }
  }

  async deleteGroup(id: number): Promise<void> {
    try {
      const group = await this.getGroupById(id);
      await this.groupRepository.remove(group);
    } catch (error) {
      throw new BadRequestException(`Failed to delete group: ${error.message}`);
    }
  }

  async removeStudentFromGroup(groupId: number, studentId: number): Promise<Group> {
    try {
      const group = await this.getGroupById(groupId);

      const student = group.students.find((student) => student.id === studentId);
      if (!student) throw new NotFoundException('Student not found in group');

      group.students = group.students.filter((student) => student.id !== studentId);
      return this.groupRepository.save(group);
    } catch (error) {
      throw new BadRequestException(`Failed to remove student from group: ${error.message}`);
    }
  }

  async getGroupsByCourseId(courseId: number): Promise<Group[]> {
    try {
      return await this.groupRepository.find({
        where: { course: { id: courseId } },
        relations: ['teacher', 'students'],
      });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch groups by course ID: ${error.message}`);
    }
  }

  async getStudentsByGroupId(groupId: number): Promise<Student[]> {
    try {
      const group = await this.getGroupById(groupId);
      return group.students;
    } catch (error) {
      throw new BadRequestException(`Failed to get students by group ID: ${error.message}`);
    }
  }
}
