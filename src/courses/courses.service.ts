import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Courses } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  private courses: Courses[] = [];

  // Kurslarni ko'rish (faqat admin uchun)
  findAll(user: any): Courses[] {
    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Access denied: only admins can view courses.',
      );
    }
    return this.courses;
  }

  // Kursni ID bo'yicha topish (faqat admin uchun)
  findOne(id: string, user: any): Courses {
    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Access denied: only admins can view this course.',
      );
    }
    const course = this.courses.find((course) => course.id === id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found!`);
    }
    return course;
  }

  // Kurs yaratish (faqat admin uchun)
  create(createCourseDto: CreateCourseDto, user: any): Courses {
    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Access denied: only admins can create courses.',
      );
    }
    const newCourse: Courses = {
      id: Date.now().toString(),
      ...createCourseDto,
      users: undefined,
    };
    this.courses.push(newCourse);
    return newCourse;
  }

  // Kursni yangilash (faqat admin uchun)
  update(id: string, updateCourseDto: Partial<Courses>, user: any): Courses {
    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Access denied: only admins can update courses.',
      );
    }
    const courseIndex = this.courses.findIndex((course) => course.id === id);
    if (courseIndex === -1) {
      throw new NotFoundException(`Course with ID ${id} not found!`);
    }

    this.courses[courseIndex] = {
      ...this.courses[courseIndex],
      ...updateCourseDto,
    };
    return this.courses[courseIndex];
  }

  // Kursni o'chirish (faqat admin uchun)
  remove(id: string, user: any): Courses {
    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Access denied: only admins can delete courses.',
      );
    }
    const courseIndex = this.courses.findIndex((course) => course.id === id);
    if (courseIndex === -1) {
      throw new NotFoundException(`Course with ID ${id} not found!`);
    }

    const deletedCourse = this.courses[courseIndex];
    this.courses.splice(courseIndex, 1);
    return deletedCourse;
  }
}
