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
import { Student } from './entities/student.entity';
import { AuthGuard, Roles, RolesGuard } from 'src/auth/auth.guard';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  async createStudent(
    @Body() createStudentDto: CreateStudentDto,
  ): Promise<Student> {
    return this.studentsService.createStudent(createStudentDto);
  }

  
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  async getAllStudents(): Promise<Student[]> {
    return this.studentsService.getAllStudents();
  }

  
  
  @Roles('admin', "teacher")
  @UseGuards(AuthGuard, RolesGuard)
  @Get('search')
  async searchStudents(@Query('name') name: string): Promise<Student[]> {
    return this.studentsService.searchStudents(name);
  }

  
  @UseGuards(AuthGuard)
  @Get(':id')
  async getStudentById(@Param('id') id: number): Promise<Student> {
    return this.studentsService.getStudentById(id);
  }

  
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Put(':id')
  async updateStudent(
    @Param('id') id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    return this.studentsService.updateStudent(id, updateStudentDto);
  }

  
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  async deleteStudent(@Param('id') id: number): Promise<void> {
    await this.studentsService.deleteStudent(id);
  }
}
