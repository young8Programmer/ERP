import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { Repository } from 'typeorm';
import { Lesson } from 'src/lesson/entities/lesson.entity';
import { Teacher } from 'src/teacher/entities/teacher.entity';
import { Student } from 'src/students/entities/student.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class AssignmentsService {
  private s3Client: S3Client;

  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {
    const keyId = process.env.B2_KEY_ID || '00553be104919e10000000009';
    const appKey = process.env.B2_APPLICATION_KEY || 'K005+e8lkuH/zzNz/AfcCasFiITMXt4';

    console.log('B2_KEY_ID:', keyId);
    console.log('B2_APPLICATION_KEY:', appKey);

    if (!keyId || !appKey) {
      throw new Error('Backblaze B2 kredensiallari topilmadi');
    }

    this.s3Client = new S3Client({
      endpoint: 'https://s3.us-east-005.backblazeb2.com',
      region: 'us-east-005',
      credentials: {
        accessKeyId: keyId,
        secretAccessKey: appKey,
      },
      forcePathStyle: true,
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

    const fileName = `${Date.now()}-${file.originalname}`;
    const params = {
      Bucket: 'erp-backend',
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(params));
    } catch (error) {
      throw new BadRequestException(`Faylni Backblaze B2 ga yuklashda xato: ${error.message}`);
    }

    const fileUrl = `https://f005.backblazeb2.com/file/erp-backend/${fileName}`;

    const newAssignment = this.assignmentRepository.create({
      lesson,
      title,
      description,
      fileUrl,
      status: 'pending',
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    await this.assignmentRepository.save(newAssignment);

    return { message: 'Assignment successfully created', assignmentId: newAssignment.id, fileUrl };
  }

  async getAssignmentFile(assignmentId: number): Promise<{ stream: Readable; fileName: string; contentType: string }> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      select: ['fileUrl'],
    });

    if (!assignment || !assignment.fileUrl) {
      throw new NotFoundException('Fayl topilmadi');
    }

    const fileName = assignment.fileUrl.split('/').pop();
    const params = {
      Bucket: 'erp-backend',
      Key: fileName,
    };

    try {
      const { Body, ContentType } = await this.s3Client.send(new GetObjectCommand(params));
      return {
        stream: Body as Readable,
        fileName,
        contentType: ContentType || 'application/octet-stream',
      };
    } catch (error) {
      throw new NotFoundException(`Faylni Backblaze B2 dan olishda xato: ${error.message}`);
    }
  }

  async updateAssignment(teacherId: number, assignmentId: number, updateData: Partial<CreateAssignmentDto>, file?: any) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['lesson', 'lesson.group', 'lesson.group.teacher'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }

    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });

    if (!teacher || assignment.lesson.group.teacher.id !== teacher.id) {
      throw new ForbiddenException('Siz faqat o‘zingizga tegishli guruhdagi topshiriqni o‘zgartira olasiz');
    }

    if (file && file.buffer) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const params = {
        Bucket: 'erp-backend',
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      try {
        await this.s3Client.send(new PutObjectCommand(params));
        assignment.fileUrl = `https://f005.backblazeb2.com/file/erp-backend/${fileName}`;
      } catch (error) {
        throw new BadRequestException(`Faylni Backblaze B2 ga yuklashda xato: ${error.message}`);
      }
    }

    Object.assign(assignment, updateData);
    if (updateData.dueDate) {
      assignment.dueDate = new Date(updateData.dueDate);
    }

    await this.assignmentRepository.save(assignment);

    return { message: 'Assignment successfully updated', fileUrl: assignment.fileUrl };
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
      throw new ForbiddenException('Siz faqat o‘zingizga tegishli guruhdagi topshiriqni o‘chira olasiz');
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
        throw new ForbiddenException('Siz faqat o‘zingizga tegishli guruhdagi topshiriqlarni ko‘ra olasiz');
      }
    }

    if (role === 'student') {
      const student = await this.studentRepository.findOne({ where: { id: userId } });

      if (!student || !lesson.group.students.some((s) => s.id === student.id)) {
        throw new ForbiddenException('Siz ushbu guruhga tegishli darslarni ko‘ra olmaysiz');
      }
    }

    const assignments = await this.assignmentRepository.find({
      where: { lesson: { id: lessonId } },
      relations: ['submissions'],
    });

    if (!assignments || assignments.length === 0) {
      throw new NotFoundException('No assignments found for this lesson');
    }

    return assignments;
  }
}