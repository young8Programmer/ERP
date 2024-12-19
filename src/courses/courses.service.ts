import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async createCourse(createCourseDto: CreateCourseDto): Promise<Course> {
    const existingCourse = await this.courseRepository.findOne({ where: { name: createCourseDto.name } });
    if (existingCourse) {
      throw new BadRequestException(`Kurs nomi ${createCourseDto.name} allaqachon mavjud`);
    }

    const course = this.courseRepository.create(createCourseDto);
    return this.courseRepository.save(course);
  }

  async getAllCourses(): Promise<Course[]> {
    return this.courseRepository.find({ relations: ['groups'] });
  }

  async getCourseById(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { id }, relations: ['groups'] });
    if (!course) {
      throw new NotFoundException(`Kurs ID ${id} topilmadi`);
    }
    return course;
  }

  async updateCourse(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.getCourseById(id);
    if (!course) {
      throw new NotFoundException(`Kurs ID ${id} topilmadi`);
    }

    if (updateCourseDto.name) {
      const existingCourse = await this.courseRepository.findOne({ where: { name: updateCourseDto.name } });
      if (existingCourse && existingCourse.id !== id) {
        throw new BadRequestException(`Kurs nomi ${updateCourseDto.name} allaqachon mavjud`);
      }
    }

    Object.assign(course, updateCourseDto);
    return this.courseRepository.save(course);
  }

  async deleteCourse(id: number): Promise<void> {
    const course = await this.getCourseById(id);
    if (!course) {
      throw new NotFoundException(`Kurs ID ${id} topilmadi`);
    }
    await this.courseRepository.remove(course);
  }
}
