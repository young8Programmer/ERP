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
    try {
      const { name, courseId, teacherId, students } = createGroupDto;

      const course = await this.courseRepository.findOne({ where: { id: courseId } });
      if (!course) throw new BadRequestException('Course not found');

      const teacher = teacherId
        ? await this.teacherRepository.findOne({ where: { id: teacherId } })
        : null;

      if (teacherId && !teacher) throw new BadRequestException('Teacher not found');

      const studentEntities = students
        ? await this.studentRepository.findByIds(students)
        : [];

      const group = this.groupRepository.create({
        name,
        course,
        teacher,
        students: studentEntities,
      });

      return this.groupRepository.save(group);
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

  async getGroupsByTeacherId(teacherId: string): Promise<Group[]> {
    const parsedTeacherId = parseInt(teacherId, 10); // Stringni integerga aylantiramiz
    if (isNaN(parsedTeacherId)) {
      throw new BadRequestException('Teacher ID must be a valid number');
    }

    try {
      return await this.groupRepository.find({ where: { teacher: { id: parsedTeacherId } } });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch groups by teacher ID: ${error.message}`);
    }
  }

  async getGroupsByStudentId(studentId: number): Promise<Group[]> {
    try {
      return await this.groupRepository.find({ where: { students: { id: studentId } } });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch groups by student ID: ${error.message}`);
    }
  }

  async getAllGroupsForAdmin(): Promise<Group[]> {
    try {
      return await this.groupRepository.find({ relations: ['course', 'teacher', 'students'] });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch all groups for admin: ${error.message}`);
    }
  }

  async getStudentsInGroup(groupId: number): Promise<any[]> {
    try {
      const group = await this.getGroupById(groupId);
      return group.students.map((student) => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
      }));
    } catch (error) {
      throw new BadRequestException(`Failed to get students in group: ${error.message}`);
    }
  }

  async updateGroup(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    try {
      const group = await this.getGroupById(id);

      if (updateGroupDto.name) group.name = updateGroupDto.name;

      if (updateGroupDto.courseId) {
        const course = await this.courseRepository.findOne({
          where: { id: updateGroupDto.courseId },
        });
        if (!course) throw new BadRequestException('Course not found');
        group.course = course;
      }

      if (updateGroupDto.teacherId) {
        const teacher = await this.teacherRepository.findOne({
          where: { id: updateGroupDto.teacherId },
        });
        if (!teacher) throw new BadRequestException('Teacher not found');
        group.teacher = teacher;
      }

      if (updateGroupDto.students) {
        const students = await this.studentRepository.findByIds(updateGroupDto.students);
        group.students = students;
      }

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
      group.students = group.students.filter((student) => student.id !== studentId);
      return this.groupRepository.save(group);
    } catch (error) {
      throw new BadRequestException(`Failed to remove student from group: ${error.message}`);
    }
  }

  async getGroupsByCourseId(courseId: number): Promise<Group[]> {
    try {
      return await this.groupRepository.find({ where: { course: { id: courseId } } });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch groups by course ID: ${error.message}`);
    }
  }
}
