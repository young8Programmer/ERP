import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    const courses = this.coursesService.getAll();
    return {
      message: 'All courses retrieved successfully!',
      data: courses,
    };
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    const course = this.coursesService.getById(id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found!`);
    }
    return {
      message: `Course with ID ${id} retrieved successfully!`,
      data: course,
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    const newCourse = this.coursesService.create(createCourseDto);
    return {
      message: 'Course created successfully!',
      data: newCourse,
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Put(':id')
  update(@Param('id') id: number, @Body() updateCourseDto: Partial<Course>) {
    const updatedCourse = this.coursesService.update(id, updateCourseDto);
    if (!updatedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found!`);
    }
    return {
      message: `Course with ID ${id} updated successfully!`,
      data: updatedCourse,
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: number) {
    const deletedCourse = this.coursesService.delete(id);
    if (!deletedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found!`);
    }
    return {
      message: `Course with ID ${id} deleted successfully!`,
      data: deletedCourse,
    };
  }
}
