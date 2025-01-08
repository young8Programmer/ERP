import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles, RolesGuard } from 'src/auth/roles.guard';import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesSuperAdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token);
      if (payload.role !== 'superAdmin') {
        throw new UnauthorizedException(
          'Faqat superAdminlarga ushbu amalni bajarishga ruxsat beriladi',
        );
      }
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid access token');
    }
  }
}


@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
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
