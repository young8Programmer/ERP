import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
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

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new BadRequestException('Kurs topilmadi');
    }

    let teacher = null;
    if (teacherId) {
      teacher = await this.teacherRepository.findOne({
        where: { id: teacherId },
      });
      if (!teacher) {
        throw new BadRequestException("O'qituvchi topilmadi");
      }
    }

    let studentEntities = [];
    if (students && students.length > 0) {
      studentEntities = await this.studentRepository.findByIds(students);
      if (studentEntities.length !== students.length) {
        throw new BadRequestException('Baʼzi talabalar topilmadi');
      }
    }

    const existingGroup = await this.groupRepository.findOne({
      where: { name },
      relations: ['course', 'teacher', 'students'],
    });
    if (existingGroup) {
      throw new BadRequestException('Bunday nomli guruh mavjud');
    }

    const group = this.groupRepository.create({
      name,
      course,
      teacher,
      students: studentEntities,
    });

    return this.groupRepository.save(group);
  }

  // Guruhga o'quvchini qo'shish
  async addStudentToGroup(groupId: number, studentId: number): Promise<Group> {
    const group = await this.getGroupById(groupId);

    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`O'quvchi ID ${studentId} topilmadi`);
    }

    group.students.push(student);

    return this.updateGroup(groupId, group);
  }

  // Admin uchun barcha guruhlarni olish
  async getAllGroupsForAdmin(): Promise<Group[]> {
    return this.groupRepository.find({
      relations: ['course', 'teacher', 'students'],
    });
  }

  async getGroupById(id: number): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['course', 'teacher', 'students'],
    });
    if (!group) {
      throw new NotFoundException(`Guruh ID ${id} topilmadi`);
    }
    return group;
  }
  async getGroupsByTeacherId(teacherId: number): Promise<Group[]> {
    // teacherId ni validatsiya qilish
    if (isNaN(teacherId)) {
      throw new BadRequestException('Teacher ID must be a valid number');
    }

    return this.groupRepository.find({
      where: { teacher: { id: teacherId } },
      relations: ['course', 'students'],
    });
  }

  async getGroupsByStudentId(studentId: number): Promise<Group[]> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['groups'],
    });
    if (!student) {
      throw new NotFoundException(`ID ${studentId} bo'yicha talaba topilmadi`);
    }
    return student.groups;
  }

  async getStudentsInGroup(groupId: number): Promise<any> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['students'],
    });

    if (!group) {
      throw new NotFoundException(`Guruh ID ${groupId} topilmadi`);
    }

    return group.students.map((student) => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone,
    }));
  }

  async updateGroup(groupId: number, updatedGroup: Group): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['course', 'teacher', 'students'],
    });

    if (!group) {
      throw new NotFoundException(`Guruh ID ${groupId} topilmadi`);
    }

    group.name = updatedGroup.name || group.name;
    group.students = updatedGroup.students;

    await this.groupRepository.save(group);

    return group;
  }

  async deleteGroup(id: number): Promise<void> {
    const group = await this.getGroupById(id);
    if (!group) {
      throw new NotFoundException(`Guruh ID ${id} topilmadi`);
    }
    await this.groupRepository.remove(group);
  }

  async removeStudentFromGroup(
    groupId: number,
    studentId: number,
  ): Promise<any> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['students'],
    });

    if (!group) {
      throw new NotFoundException(`ID ${groupId} bo'yicha guruh topilmadi`);
    }

    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`ID ${studentId} bo'yicha  talaba topilmadi`);
    }

    group.students = group.students.filter((s) => s.id !== studentId);
    await this.groupRepository.save(group);

    return { message: `O'quvchi ID ${studentId} guruhdan o'chirildi` };
  }

  async getGroupsByCourseId(courseId: number): Promise<Group[]> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Kurs ID ${courseId} topilmadi`);
    }

    return this.groupRepository.find({
      where: { course: { id: courseId } },
      relations: ['course', 'teacher', 'students'],
    });
  }
}
