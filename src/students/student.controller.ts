import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Roles } from '../auth/roles.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '../auth/auth.guard';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async createStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.createStudent(createStudentDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAllStudents() {
    return this.studentService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOneStudent(@Param('id') id: number) {
    return this.studentService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async updateStudent(@Param('id') id: number, @Body() updateStudent: UpdateStudentDto) {
    return this.studentService.update(id, updateStudent);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async removeStudent(@Param('id') id: number) {
    return this.studentService.remove(id);
  }
}
