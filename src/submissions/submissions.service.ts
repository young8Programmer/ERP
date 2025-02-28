import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission, SubmissionStatus } from './entities/submission.entity';
import { Student } from 'src/students/entities/student.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Lesson } from 'src/lesson/entities/lesson.entity';
import { Teacher } from 'src/teacher/entities/teacher.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { GradeSubmissionDto } from './dto/GradeSubmissionDto';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class SubmissionService {
  private s3Client: S3Client;

  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
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

  async submitAnswer(userId: number, file: any, comment: string, assignmentId: number) {
    if (!file || !file.buffer) {
      throw new ForbiddenException('Fayl noto‘g‘ri yuklangan yoki yo‘q');
    }

    const student = await this.studentRepository.findOne({ where: { id: userId } });
    if (!student) throw new ForbiddenException('Talaba topilmadi');

    const assignment = await this.assignmentRepository.findOne({ where: { id: assignmentId } });
    if (!assignment) throw new ForbiddenException('Topshiriq topilmadi');

    if (new Date() > assignment.dueDate) {
      throw new ForbiddenException('Deadline tugagan, topshiriq qabul qilinmaydi');
    }

    const existingSubmission = await this.submissionRepository.findOne({
      where: { student: { id: userId }, assignment: { id: assignmentId } },
    });

    if (existingSubmission) {
      throw new ForbiddenException('Siz allaqachon ushbu topshiriq uchun javob yuborgansiz');
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
      throw new ForbiddenException(`Faylni Backblaze B2 ga yuklashda xato: ${error.message}`);
    }

    const fileUrl = `https://f005.backblazeb2.com/file/erp-backend/${fileName}`;

    const submission = this.submissionRepository.create({
      fileUrl,
      comment,
      grade: 0,
      status: SubmissionStatus.PENDING,
      student,
      assignment,
    });

    await this.submissionRepository.save(submission);

    return {
      message: 'Topshiriq muvaffaqiyatli topshirildi',
      submissionId: submission.id,
      fileUrl: submission.fileUrl,
    };
  }

  async getSubmissionFile(submissionId: number): Promise<{ stream: Readable; fileName: string; contentType: string }> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      select: ['fileUrl'],
    });

    if (!submission || !submission.fileUrl) {
      throw new NotFoundException('Fayl topilmadi');
    }

    const fileName = submission.fileUrl.split('/').pop();
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

  async getAllSubmissions() {
    return this.submissionRepository.find({
      relations: ['assignment'],
    });
  }

  async gradeSubmission(teacherId: number, submissionId: number, dto: GradeSubmissionDto) {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ['assignment', 'assignment.lesson', 'assignment.lesson.group', 'assignment.lesson.group.teacher'],
    });

    if (!submission) throw new NotFoundException('Topshiriq topilmadi');

    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
    if (!teacher || submission.assignment.lesson.group.teacher.id !== teacher.id) {
      throw new ForbiddenException('Siz faqat o‘zingizga tegishli guruhdagi topshiriqlarni baholay olasiz');
    }

    if (dto.grade < 0 || dto.grade > 100) throw new ConflictException('Baho 0 dan 100 gacha bo‘lishi kerak');

    submission.grade = dto.grade;
    submission.comment = dto.comment;
    submission.status = dto.grade >= 60 ? SubmissionStatus.ACCEPTED : SubmissionStatus.REJECTED;

    await this.submissionRepository.save(submission);

    return { message: 'Baho qo‘yildi', submission };
  }

  async getLessonSubmissions(teacherId: number, lessonId: number) {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['group', 'group.teacher'],
    });
    if (!lesson) throw new NotFoundException('Dars topilmadi');

    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
    if (!teacher || lesson.group.teacher.id !== teacher.id) {
      throw new ForbiddenException('Siz faqat o‘zingizga tegishli guruhdagi topshiriqlarni ko‘ra olasiz');
    }

    return this.submissionRepository.find({
      where: { assignment: { lesson: { id: lessonId } } },
      relations: ['student', 'assignment'],
    });
  }

  async getLessonSubmissionsByStatus(teacherId: number, lessonId: number, status: SubmissionStatus) {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['group', 'assignments', 'group.teacher'],
    });
    if (!lesson) throw new NotFoundException('Dars topilmadi');

    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
    if (!teacher || lesson.group.teacher.id !== teacher.id) {
      throw new ForbiddenException('Siz faqat o‘zingizga tegishli guruhdagi topshiriqlarni ko‘ra olasiz');
    }

    const students = await this.studentRepository.find({
      where: { groups: lesson.group },
    });

    const submissions = await this.submissionRepository.find({
      where: { assignment: { lesson: { id: lessonId } } },
      relations: ['student', 'assignment'],
    });

    if (status === SubmissionStatus.UNSUBMITTED) {
      const submittedStudentIds = submissions.map((s) => s.student.id);
      return students.filter((student) => !submittedStudentIds.includes(student.id));
    }

    return submissions.filter((submission) => submission.status === status);
  }

  async getDailyGrades(userId: number, groupId: number) {
    const teacher = await this.teacherRepository.findOne({ where: { id: userId } });
    if (!teacher) {
      throw new ForbiddenException('Faqat o‘qituvchilar kunlik baholarni ko‘ra oladi');
    }

    const group = await this.groupRepository.findOne({ where: { id: groupId }, relations: ['students'] });
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }

    const studentIds = group.students.map((student) => student.id);

    return this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .where('submission.submittedAt >= CURRENT_DATE')
      .andWhere('student.id IN (:...studentIds)', { studentIds })
      .andWhere('submission.grade IS NOT NULL')
      .select([
        'student.id AS studentId',
        'student.firstName AS firstName',
        'student.lastName AS lastName',
        'MAX(submission.submittedAt) AS submittedAt',
        'SUM(submission.grade) AS totalGrade',
      ])
      .groupBy('student.id')
      .addGroupBy('student.firstName')
      .addGroupBy('student.lastName')
      .having('SUM(submission.grade) > 0')
      .orderBy('submittedAt', 'ASC')
      .getRawMany();
  }

  async getTotalScores(groupId: number) {
    const group = await this.groupRepository.findOne({ where: { id: groupId }, relations: ['students'] });
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }

    const studentIds = group.students.map((student) => student.id);

    return this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .where('student.id IN (:...studentIds)', { studentIds })
      .select([
        'student.id AS studentId',
        'student.firstName AS firstName',
        'student.lastName AS lastName',
        'SUM(submission.grade) AS totalGrade',
      ])
      .groupBy('student.id')
      .addGroupBy('student.firstName')
      .addGroupBy('student.lastName')
      .orderBy('totalGrade', 'DESC')
      .getRawMany();
  }

  async getUnsubmittedStudents(assignmentId: number) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['lesson'],
    });
    if (!assignment) throw new NotFoundException('Topshiriq topilmadi');

    const lesson = await this.lessonRepository.findOne({
      where: { id: assignment.lesson.id },
      relations: ['group'],
    });
    if (!lesson) throw new NotFoundException('Dars topilmadi');

    const group = await this.groupRepository.findOne({
      where: { id: lesson.group.id },
      relations: ['students'],
    });
    if (!group) throw new NotFoundException('Guruh topilmadi');

    const allStudents = group.students;
    const submittedStudents = await this.submissionRepository.find({
      where: { assignment: { id: assignmentId } },
      relations: ['student'],
    });

    const submittedStudentIds = submittedStudents.map((s) => s.student.id);
    return allStudents.filter((student) => !submittedStudentIds.includes(student.id));
  }

  async deleteSubmission(submissionId: number) {
    const submission = await this.submissionRepository.findOne({ where: { id: submissionId } });

    if (!submission) {
      throw new NotFoundException('Submission topilmadi');
    }

    await this.submissionRepository.remove(submission);

    return { success: true, message: 'Submission o‘chirildi' };
  }
}