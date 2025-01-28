import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AuthGuard, Roles, RolesGuard } from 'src/auth/auth.guard';
import { CreateAssignmentDto } from './dto/create-assignment.dto';  // Import qilish

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Roles('teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  async create(@Req() req, @Body() createAssignmentDto: CreateAssignmentDto) {
    const teacherId = req.user.id;
    return this.assignmentsService.createAssignment(teacherId, createAssignmentDto);
  }

  
  @Roles('teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('teacher')
  @Put(':id')
  async updateAssignment(@Req() req, @Param('id') id: string, @Body() updateData: { assignment?: string; status?: string }) {
    const teacherId = req.user.id; 
    return this.assignmentsService.updateAssignment(teacherId, +id, updateData);
  }

  
  @Roles('teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const teacherId = req.user.id;
    return this.assignmentsService.remove(teacherId, +id);
  }

  @UseGuards(AuthGuard)
  @Get('lesson/:lessonId')
  async findAssignmentsForUser(@Req() req, @Param('lessonId') lessonId: string) {
    const userId = req.user.id; 
    const role = req.user.role; 

    return this.assignmentsService.findAssignmentsForUser(+lessonId, userId, role);
  }

}
