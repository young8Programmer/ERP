import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.guard';
import { RolesTeacherGuard } from 'src/auth/rolesTeacherGuard';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Post()
  async create(@Req() req, @Body() assignmentData: { group_id: number; lesson_id: number; assignment: string }) {
    const teacherId = req.user.id; // Token orqali olingan ID
    return this.assignmentsService.create(teacherId, assignmentData);
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Put(':id')
  async updateAssignment(@Req() req, @Param('id') id: string, @Body() updateData: { assignment?: string; status?: string }) {
    const teacherId = req.user.id; // Token orqali olingan ID
    return this.assignmentsService.updateAssignment(teacherId, +id, updateData);
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const teacherId = req.user.id; // Token orqali olingan ID
    return this.assignmentsService.remove(teacherId, +id);
  }
}
