import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    const courses = this.coursesService.findAll();
    return {
      message: 'All courses retrieved successfully!',
      data: courses,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const course = this.coursesService.findOne(id);
    if (!course) {
      return { message: `Course with ID ${id} not found!` };
    }
    return {
      message: `Course with ID ${id} retrieved successfully!`,
      data: course,
    };
  }

  @Post('create')
  create(@Body() createCourseDto: any) {
    const newCourse = this.coursesService.create(createCourseDto);
    return {
      message: 'Course created successfully!',
      data: newCourse,
    };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: any) {
    const updatedCourse = this.coursesService.update(id, updateCourseDto);
    if (!updatedCourse) {
      return { message: `Course with ID ${id} not found!` };
    }
    return {
      message: `Course with ID ${id} updated successfully!`,
      data: updatedCourse,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const deletedCourse = this.coursesService.remove(id);
    if (!deletedCourse) {
      return { message: `Course with ID ${id} not found!` };
    }
    return {
      message: `Course with ID ${id} deleted successfully!`,
      data: deletedCourse,
    };
  }
}
