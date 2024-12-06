import { Injectable, NotFoundException } from '@nestjs/common';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  private courses: Course[] = [];

  // Barcha kurslarni ko'rish
  findAll(): Course[] {
    return this.courses;
  }

  // Kursni ID bo'yicha topish
  findOne(id: string): Course | undefined {
    return this.courses.find((course) => course.id === id);
  }

  // Kurs yaratish
  create(createCourseDto: CreateCourseDto): Course {
    const newCourse: Course = { id: Date.now().toString(), ...createCourseDto };
    this.courses.push(newCourse);
    return newCourse;
  }

  // Kursni yangilash
  update(id: string, updateCourseDto: Partial<Course>): Course | undefined {
    const courseIndex = this.courses.findIndex((course) => course.id === id);
    if (courseIndex === -1) return undefined;

    this.courses[courseIndex] = {
      ...this.courses[courseIndex],
      ...updateCourseDto,
    };
    return this.courses[courseIndex];
  }

  // Kursni o'chirish
  remove(id: string): Course | undefined {
    const courseIndex = this.courses.findIndex((course) => course.id === id);
    if (courseIndex === -1) return undefined;

    const deletedCourse = this.courses[courseIndex];
    this.courses.splice(courseIndex, 1);
    return deletedCourse;
  }
}
