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
  Req,
} from '@nestjs/common';
import { GroupsService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { AuthGuard, Roles, RolesGuard } from 'src/auth/auth.guard';
import { AddStudentDto } from 'src/students/dto/AddStudentDto';
import { Student } from 'src/students/entities/student.entity';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  async createGroup(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupsService.createGroup(createGroupDto);
  }
  
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Post(':groupId/add-student')
  async addStudentToGroup(
    @Param('groupId') groupId: number,
    @Body() addStudentDto: AddStudentDto,
  ): Promise<Group> {
    return this.groupsService.addStudentToGroup(groupId, addStudentDto.studentId);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getGroupById(@Param('id') id: number): Promise<Group> {
    return this.groupsService.getGroupById(id);
  }

  @Roles("teacher")
  @UseGuards(AuthGuard, RolesGuard)
  @Get('my/teacher/groups')
  async getMyGroups(@Req() req: any): Promise<Group[]> {
    const userUsername = req.user.username;
    return this.groupsService.getGroupsByTeacherId(userUsername);
  }

  @Roles("student")
  @UseGuards(AuthGuard, RolesGuard)
  @Get('my/student/groups')
  async getStudentGroups(@Req() req): Promise<Group[]> {
    const userUsername = req.user.username;
    return this.groupsService.getGroupsByStudentId(userUsername);
  }

  
  @Roles('teacher', "admin")
  @UseGuards(AuthGuard, RolesGuard)
  @Get(':groupId/students')
  async getStudentsInGroup(@Param('groupId') groupId: number): Promise<any[]> {
    return this.groupsService.getStudentGroups(groupId);
  }

  
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  async getAllGroupsForAdmin(): Promise<Group[]> {
    return this.groupsService.getAllGroupsForAdmin();
  }

  
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Put(':id')
  async updateGroup(
    @Param('id') id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return this.groupsService.updateGroup(id, updateGroupDto);
  }
  
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  async deleteGroup(@Param('id') id: number): Promise<void> {
    return this.groupsService.deleteGroup(id);
  }

  
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':groupId/students/:studentId')
  async removeStudentFromGroup(
    @Param('groupId') groupId: number,
    @Param('studentId') studentId: number,
  ): Promise<Group> {
    return this.groupsService.removeStudentFromGroup(groupId, studentId);
  }

  @UseGuards(AuthGuard)
  @Get('/course/:courseId')
  async getGroupsByCourseId(@Param('courseId') courseId: number): Promise<Group[]> {
    return this.groupsService.getGroupsByCourseId(courseId);
  }

  @UseGuards(AuthGuard)
  @Get(':groupId/students/list')
  async getStudentsByGroupId(@Param('groupId') groupId: number): Promise<Student[]> {
    return this.groupsService.getStudentsByGroupId(groupId);
  }
}
