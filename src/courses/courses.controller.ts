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
  Req,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Courses } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard, Roles } from 'src/auth/roles.guard';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll(@Req() req) {
    const user = req.user;
    const courses = this.coursesService.findAll(user);
    return {
      message: 'All courses retrieved successfully!',
      data: courses,
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    const user = req.user;
    const course = this.coursesService.findOne(id, user);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found!`);
    }
    return {
      message: `Course with ID ${id} retrieved successfully!`,
      data: course,
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createCourseDto: CreateCourseDto, @Req() req) {
    const user = req.user;
    const newCourse = this.coursesService.create(createCourseDto, user);
    return {
      message: 'Course created successfully!',
      data: newCourse,
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: Partial<Courses>,
    @Req() req,
  ) {
    const user = req.user;
    const updatedCourse = this.coursesService.update(id, updateCourseDto, user);
    if (!updatedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found!`);
    }
    return {
      message: `Course with ID ${id} updated successfully!`,
      data: updatedCourse,
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const user = req.user;
    const deletedCourse = this.coursesService.remove(id, user);
    if (!deletedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found!`);
    }
    return {
      message: `Course with ID ${id} deleted successfully!`,
      data: deletedCourse,
    };
  }
}
