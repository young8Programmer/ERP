import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.guard';
import { RolesTeacherGuard } from 'src/auth/rolesTeacherGuard';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Get()
  async findAll() {
    try {
      const assignments = await this.assignmentsService.findAll();
      return {
        message: 'Barcha topshiriqlar muvaffaqiyatli olingan.',
        assignments,
      };
    } catch (error) {
      throw new Error('Barcha topshiriqlarni olishda xatolik yuz berdi');
    }
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Get(':assignment_id')
  async getAssignment(@Param('assignment_id') assignmentId: string) {
    try {
      const assignment =
        await this.assignmentsService.getAssignmentById(+assignmentId);
      if (!assignment) {
        throw new NotFoundException('Topshiriq topilmadi');
      }
      return { message: 'Topshiriq muvaffaqiyatli topildi.', assignment };
    } catch (error) {
      throw new NotFoundException('Topshiriq topilmadi');
    }
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Post()
  async create(
    @Body()
    assignmentData: {
      group_id: number;
      lesson_id: number;
      assignment: string;
    },
  ) {
    try {
      const createdAssignment =
        await this.assignmentsService.create(assignmentData);
      return {
        message: 'Topshiriq muvaffaqiyatli yaratildi.',
        assignment: createdAssignment,
      };
    } catch (error) {
      throw new Error('Topshiriqni yaratishda xatolik yuz berdi');
    }
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Put(':assignment_id')
  async updateAssignment(
    @Param('assignment_id') assignmentId: string,
    @Body() updateData: { assignment?: string; status?: string },
  ) {
    try {
      const updatedAssignment = await this.assignmentsService.updateAssignment(
        +assignmentId,
        updateData,
      );
      if (!updatedAssignment) {
        throw new NotFoundException('Topshiriq topilmadi');
      }
      return {
        message: 'Topshiriq muvaffaqiyatli yangilandi.',
        assignment: updatedAssignment,
      };
    } catch (error) {
      throw new NotFoundException('Topshiriqni yangilashda xatolik yuz berdi');
    }
  }

  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const assignmentId = Number(id); // Convert string id to number
      const result = await this.assignmentsService.remove(assignmentId);

      if (!result) {
        throw new NotFoundException(`Topshiriq topilmadi (ID: ${id})`);
      }

      return {
        message: `Topshiriq muvaffaqiyatli o'chirildi (ID: ${id}).`,
        ...result,
      };
    } catch (error) {
      console.error('Xato:', error.message); // Xatolik haqida batafsil log
      throw new Error("Topshiriqni o'chirishda xatolik yuz berdi");
    }
  }
}

