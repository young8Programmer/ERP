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

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async createGroup(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupsService.createGroup(createGroupDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
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

  @UseGuards(AuthGuard)
  @Get('my-teacher-groups')
  async getMyGroups(@Request() req): Promise<Group[]> {
    return this.groupsService.getGroupsByTeacherId(req.user.id);
  }

  @UseGuards(AuthGuard, RolesStudentGuard)
  @Roles('student')
  @Get('my-student-groups')
  async getStudentGroups(@Request() req): Promise<Group[]> {
    return this.groupsService.getGroupsByStudentId(req.user.id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':groupId/students')
  async getStudentsInGroup(@Param('groupId') groupId: number): Promise<any[]> {
    return this.groupsService.getStudentsInGroup(groupId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  async getAllGroupsForAdmin(): Promise<Group[]> {
    return this.groupsService.getAllGroupsForAdmin();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async updateGroup(
    @Param('id') id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return this.groupsService.updateGroup(id, updateGroupDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteGroup(@Param('id') id: number): Promise<void> {
    return this.groupsService.deleteGroup(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
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
}
