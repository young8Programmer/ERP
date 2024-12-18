import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles, RolesGuard } from 'src/auth/roles.guard';
import { RolesUserGuard } from 'src/auth/rolesUserGuard';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
  @Post()
  async createCourse(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.coursesService.createCourse(createCourseDto);
  }

  @UseGuards(AuthGuard, RolesUserGuard)
  @Get()
  async getAllCourses(): Promise<Course[]> {
    return this.coursesService.getAllCourses();
  }

  @UseGuards(AuthGuard, RolesUserGuard)
  @Get(':id')
  async getCourseById(@Param('id') id: number): Promise<Course> {
    return this.coursesService.getCourseById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
  @Put(':id')
  async updateCourse(@Param('id') id: number, @Body() updateCourseDto: UpdateCourseDto): Promise<Course> {
    return this.coursesService.updateCourse(id, updateCourseDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
  @Delete(':id')
  async deleteCourse(@Param('id') id: number): Promise<void> {
    await this.coursesService.deleteCourse(id);
  }
}
