import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { AuthGuard, Roles, RolesGuard } from 'src/auth/auth.guard';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Roles("admin")
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  async createCourse(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.coursesService.createCourse(createCourseDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllCourses(): Promise<Course[]> {
    return this.coursesService.getAllCourses();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getCourseById(@Param('id') id: number): Promise<Course> {
    return this.coursesService.getCourseById(id);
  }

  @Roles("admin")
  @UseGuards(AuthGuard, RolesGuard)
  @Put(':id')
  async updateCourse(@Param('id') id: number, @Body() updateCourseDto: UpdateCourseDto): Promise<Course> {
    return this.coursesService.updateCourse(id, updateCourseDto);
  }

  @Roles("admin")
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  async deleteCourse(@Param('id') id: number): Promise<void> {
    await this.coursesService.deleteCourse(id);
  }
}
