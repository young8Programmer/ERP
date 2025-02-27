import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Lesson } from 'src/lesson/entities/lesson.entity';
import { Teacher } from 'src/teacher/entities/teacher.entity';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Student } from 'src/students/entities/student.entity';

@Injectable()
export class AssignmentsService {
  private s3Client: S3Client;

  constructor(
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {
    this.s3Client = new S3Client({
      endpoint: 'https://s3.us-west-000.backblazeb2.com',
      region: 'us-west-000',
      credentials: {
        accessKeyId: '00553be104919e10000000001',
        secretAccessKey: 'K005a+bx/LGtQjRQbsN4usfRSztTHf4',
      },
    });
  }

  async createAssignment(teacherId: number, createAssignmentDto: CreateAssignmentDto, file: any) {
    const { lesson_id, title, description, dueDate } = createAssignmentDto;

    const lesson = await this.lessonRepository.findOne({
      where: { id: lesson_id },
      relations: ['group', 'group.teacher'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lesson_id} not found`);
    }

    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });

    if (lesson.group.teacher.id !== teacher.id) {
      throw new ForbiddenException('Siz faqat o‘zingizga tegishli guruhdagi topshiriqni yaratishingiz mumkin');
    }

    const existingAssignment = await this.assignmentRepository.findOne({
      where: { lesson: { id: lesson_id } },
    });

    if (existingAssignment) {
      throw new ConflictException(`Lesson ID ${lesson_id} uchun allaqachon topshiriq mavjud`);
    }

    if (!file || !file.buffer) {
      throw new BadRequestException('Fayl yuklanmagan yoki noto‘g‘ri');
    }

    // Faylni Backblaze B2 ga yuklash
    const fileName = `${Date.now()}-${file.originalname}`; // Fayl nomini unique qilish
    const params = {
      Bucket: 'erp-backend',
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await this.s3Client.send(new PutObjectCommand(params));
    const fileUrl = `https://f000.backblazeb2.com/file/erp-backend/${fileName}`;

    // Assignment ni yaratish
    const newAssignment = this.assignmentRepository.create({
      lesson,
      title,
      description,
      fileUrl, // Backblaze B2 dan kelgan URL
      status: 'pending',
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    await this.assignmentRepository.save(newAssignment);

    return { message: 'Assignment successfully created', assignmentId: newAssignment.id, fileUrl };
  }

  async getAssignmentFile(assignmentId: number) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      select: ['fileUrl'],
    });

    if (!assignment || !assignment.fileUrl) {
      throw new NotFoundException('Fayl topilmadi');
    }

    return { fileUrl: assignment.fileUrl };
  }

  
  async updateAssignment(teacherId: number, assignmentId: number, updateData: Partial<CreateAssignmentDto>) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['lesson', 'lesson.group', 'lesson.group.teacher'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }

    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });

    if (!teacher || assignment.lesson.group.teacher.id !== teacher.id) {
      throw new ForbiddenException('Siz faqat o\'zingizga tegishli guruhdagi topshiriqni o\'zgartira olasiz');
    }

    Object.assign(assignment, updateData);

    await this.assignmentRepository.save(assignment);

    return { message: 'Assignment successfully updated' };
  }

  async remove(teacherId: number, assignmentId: number) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['lesson', 'lesson.group', 'lesson.group.teacher'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }

    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });

    if (!teacher || assignment.lesson.group.teacher.id !== teacher.id) {
      throw new ForbiddenException('Siz faqat o\'zingizga tegishli guruhdagi topshiriqni o\'chira olasiz');
    }

    await this.assignmentRepository.remove(assignment);

    return { message: 'Assignment successfully removed' };
  }

  async findAssignmentsForUser(lessonId: number, userId: number, role: 'teacher' | 'student') {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['group', 'group.teacher', 'group.students'], 
    });
  
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }
  
    if (role === 'teacher') {
      const teacher = await this.teacherRepository.findOne({ where: { id: userId } });
      
      if (!teacher || lesson.group.teacher.id !== teacher.id) {
        throw new ForbiddenException('Siz faqat o\'zingizga tegishli guruhdagi topshiriqlarni ko\'ra olasiz');
      }
    }
  
    if (role === 'student') {
      const student = await this.studentRepository.findOne({ where: { id: userId } });
  
      if (!student || !lesson.group.students.some((s) => s.id === student.id)) {
        throw new ForbiddenException('Siz ushbu guruhga tegishli darslarni ko\'ra olmaysiz');
      }
    }
  
    const assignments = await this.assignmentRepository.find({
      where: { lesson: { id: lessonId } }, 
      relations: ["submissions"]
    });
  
    if (!assignments || assignments.length === 0) {
      throw new NotFoundException('No assignments found for this lesson');
    }
  
    return assignments;
  }
}