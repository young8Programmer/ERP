import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { GroupsService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles, RolesGuard } from 'src/auth/roles.guard';
import { RolesStudentGuard } from 'src/auth/rolesStudentGuard';
import { AddStudentDto } from 'src/students/dto/AddStudentDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from 'src/students/entities/user.entity'; // Add import for the Student entity

@Controller('groups')
export class GroupsController {
  teacherRepository: any;
  courseRepository: any;
  constructor(
    private readonly groupsService: GroupsService,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>, // Inject repository for Student
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async createGroup(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupsService.createGroup(createGroupDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':groupId/addStudent')
  async addStudentToGroup(
    @Param('groupId') groupId: number,
    @Body() addStudentDto: AddStudentDto, // AddStudentDto, guruhga qo'shish uchun kerak bo'lgan malumotlar
  ): Promise<Group> {
    const group = await this.groupsService.getGroupById(groupId);
    const student = await this.studentRepository.findOne({
      where: { id: addStudentDto.studentId },
    });

    if (!group) {
      throw new NotFoundException(`Guruh ID ${groupId} topilmadi`);
    }

    if (!student) {
      throw new NotFoundException(
        `Student ID ${addStudentDto.studentId} topilmadi`,
      );
    }

    group.students.push(student);

    return this.groupsService.updateGroup(groupId, group);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getGroupById(@Param('id') id: number): Promise<Group> {
    return this.groupsService.getGroupById(id);
  }

  @UseGuards(AuthGuard)
  @Roles('teacher')
  @Get('my-groups')
  async getMyGroups(@Request() req): Promise<Group[]> {
    const teacherId = req.user.id;
    return this.groupsService.getGroupsByTeacherId(teacherId);
  }

  @UseGuards(AuthGuard, RolesStudentGuard)
  @Roles('student')
  @Get('my-groups')
  async getStudentGroups(@Request() req) {
    const studentId = req.user.id;
    return this.groupsService.getGroupsByStudentId(studentId);
  }

  // Admin guruhdagi o'quvchilar ro'yxatini ko'rishi uchun
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':groupId/students')
  async getStudentsInGroup(@Param('groupId') groupId: number) {
    return this.groupsService.getStudentsInGroup(groupId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  async getAllGroupsForAdmin(): Promise<Group[]> {
    // Admin uchun barcha guruhlarni olish
    return this.groupsService.getAllGroupsForAdmin();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async updateGroup(
    @Param('id') id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    const group = await this.groupsService.getGroupById(id);

    // Guruhni yangilash
    if (updateGroupDto.name) {
      group.name = updateGroupDto.name;
    }

    if (updateGroupDto.courseId) {
      const course = await this.courseRepository.findOne({
        where: { id: updateGroupDto.courseId },
      });
      if (!course) {
        throw new BadRequestException('Kurs topilmadi');
      }
      group.course = course;
    }

    if (updateGroupDto.teacherId) {
      const teacher = await this.teacherRepository.findOne({
        where: { id: updateGroupDto.teacherId },
      });
      if (!teacher) {
        throw new BadRequestException("O'qituvchi topilmadi");
      }
      group.teacher = teacher;
    }

    // Agar studentlar ko'rsatilmagan bo'lsa, ularni saqlaymiz
    if (!updateGroupDto.students) {
      updateGroupDto.students = group.students.map((student) => student.id);
    }

    if (updateGroupDto.students) {
      const studentEntities = await this.studentRepository.findByIds(
        updateGroupDto.students,
      );
      group.students = studentEntities;
    }

    return this.groupsService.updateGroup(id, group);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteGroup(@Param('id') id: number): Promise<void> {
    await this.groupsService.deleteGroup(id);
  }

  // Admin guruhdan o'quvchini o'chirishi uchun
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':groupId/students/:studentId')
  async removeStudentFromGroup(
    @Param('groupId') groupId: number,
    @Param('studentId') studentId: number,
  ) {
    return this.groupsService.removeStudentFromGroup(groupId, studentId);
  }

  @UseGuards(AuthGuard)
  @Get('/course/:courseId')
  async getGroupsByCourseId(
    @Param('courseId') courseId: number,
  ): Promise<Group[]> {
    return this.groupsService.getGroupsByCourseId(courseId);
  }
}
