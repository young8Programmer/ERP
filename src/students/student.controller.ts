import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { StudentsService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles, RolesGuard } from 'src/auth/roles.guard';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async createStudent(
    @Body() createStudentDto: CreateStudentDto,
  ): Promise<Student> {
    return this.studentsService.createStudent(createStudentDto);
  }

  @UseGuards(AuthGuard)
  @Roles('admin', 'teacher')
  @Get()
  async getAllStudents(): Promise<Student[]> {
    return this.studentsService.getAllStudents();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get('search')
  async searchStudents(@Query('name') name: string): Promise<Student[]> {
    return this.studentsService.searchStudents(name);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getStudentById(@Param('id') id: number): Promise<Student> {
    return this.studentsService.getStudentById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async updateStudent(
    @Param('id') id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    return this.studentsService.updateStudent(id, updateStudentDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteStudent(@Param('id') id: number): Promise<void> {
    await this.studentsService.deleteStudent(id);
  }
}
