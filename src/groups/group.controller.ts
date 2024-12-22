import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { GroupsService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles, RolesGuard } from 'src/auth/roles.guard';
import { RolesUserGuard } from 'src/auth/rolesUserGuard';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
  @Post()
  async createGroup(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupsService.createGroup(createGroupDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllGroups(): Promise<Group[]> {
    return this.groupsService.getAllGroups();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getGroupById(@Param('id') id: number): Promise<Group> {
    return this.groupsService.getGroupById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
  @Put(':id')
  async updateGroup(@Param('id') id: number, @Body() updateGroupDto: UpdateGroupDto): Promise<Group> {
    return this.groupsService.updateGroup(id, updateGroupDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
  @Delete(':id')
  async deleteGroup(@Param('id') id: number): Promise<void> {
    await this.groupsService.deleteGroup(id);
  }

  @UseGuards(AuthGuard)
  @Get('/course/:courseId')
  async getGroupsByCourseId(@Param('courseId') courseId: number): Promise<Group[]> {
  return this.groupsService.getGroupsByCourseId(courseId);
}
}
