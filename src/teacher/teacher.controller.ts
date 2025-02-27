import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { TeachersService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher } from './entities/teacher.entity';
import { AuthGuard, RolesGuard } from 'src/auth/auth.guard';
import { Roles} from '../auth/auth.guard';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Roles("admin")
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  async createTeacher(@Body() createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    return this.teachersService.createTeacher(createTeacherDto);
  }

  @Roles("admin")
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  async getAllTeachers(): Promise<Teacher[]> {
    return this.teachersService.getAllTeachers();
  }

  
  @Roles("admin", "teacher")
  @UseGuards(AuthGuard, RolesGuard)
  @Get(':id')
  async getTeacherById(@Param('id') id: number): Promise<Teacher> {
    return this.teachersService.getTeacherById(id);
  }

  
  @Roles("admin")
  @UseGuards(AuthGuard, RolesGuard)
  @Put(':id')
  async updateTeacher(@Param('id') id: number, @Body() updateTeacherDto: UpdateTeacherDto): Promise<Teacher> {
    return this.teachersService.updateTeacher(id, updateTeacherDto);
  }

  
  @Roles("admin")
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  async deleteTeacher(@Param('id') id: number): Promise<void> {
    await this.teachersService.deleteTeacher(id);
  }
}
