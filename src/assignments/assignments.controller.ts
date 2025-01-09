import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.guard';
import { RolesTeacherGuard } from 'src/auth/rolesTeacherGuard';
import { CreateAssignmentDto } from './dto/create-assignment.dto'; // Import qilish

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Post()
  async create(@Req() req, @Body() createAssignmentDto: CreateAssignmentDto) {
    const teacherId = req.user.id;
    return this.assignmentsService.createAssignment(
      teacherId,
      createAssignmentDto,
    );
  }

  // Topshiriqni yangilash
  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Put(':id')
  async updateAssignment(
    @Req() req,
    @Param('id') id: string,
    @Body() updateData: { assignment?: string; status?: string },
  ) {
    const teacherId = req.user.id;
    return this.assignmentsService.updateAssignment(teacherId, +id, updateData);
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const teacherId = req.user.id;
    return this.assignmentsService.remove(teacherId, +id);
  }

  @UseGuards(AuthGuard)
  @Get('lesson/:lessonId')
  async findAssignmentsForUser(
    @Req() req,
    @Param('lessonId') lessonId: string,
  ) {
    const userId = req.user.id;
    const role = req.user.role;

    return this.assignmentsService.findAssignmentsForUser(
      +lessonId,
      userId,
      role,
    );
  }
}
