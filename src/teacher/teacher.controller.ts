import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard, Roles } from 'src/auth/roles.guard';

@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  // Admin faqat teacher yaratish mumkin
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async createTeacher(@Body() createTeacherDto: CreateTeacherDto) {
    const teacher = await this.teacherService.create(createTeacherDto);
    return { message: 'Teacher successfully created', teacher };
  }

  // Admin faqat teacherlarni olish mumkin
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async getTeachers() {
    const teachers = await this.teacherService.findAll();
    return { message: 'Teachers retrieved successfully', teachers };
  }

  // Admin faqat teacherni o\'chirish mumkin
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteTeacher(@Param('id') id: string) {
    await this.teacherService.remove(id);
    return { message: 'Teacher successfully deleted' };
  }

  // Admin va teacher o\'z profilini yangilashi mumkin
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  @Patch(':id')
  async updateTeacher(
    @Param('id') id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @Req() req: any,
  ) {
    const teacher = await this.teacherService.update(
      id,
      req.user,
      updateTeacherDto,
    );
    return { message: 'Teacher successfully updated', teacher };
  }
}
