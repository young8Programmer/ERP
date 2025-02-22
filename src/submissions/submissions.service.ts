import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Submission, SubmissionStatus } from './entities/submission.entity';
import { Student } from 'src/students/entities/student.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Lesson } from 'src/lesson/entities/lesson.entity';
import { Teacher } from 'src/teacher/entities/teacher.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { GradeSubmissionDto } from './dto/GradeSubmissionDto';

@Injectable()
export class SubmissionService {
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
  ) {}

  async submitAnswer(userId: number, dto: CreateSubmissionDto, assignmentId: number) {
    const student = await this.studentRepository.findOne({ where: { id: userId } });
    if (!student) throw new ForbiddenException("Talaba topilmadi");

    const assignment = await this.assignmentRepository.findOne({ where: { id: assignmentId } });
    if (!assignment) throw new ForbiddenException("Topshiriq topilmadi");

    if (new Date() > assignment.dueDate) {
      throw new ForbiddenException("Deadline vaqti tugagan, topshiriq qabul qilinmaydi");
    }

    const existingSubmission = await this.submissionRepository.findOne({
      where: { student: { id: userId }, assignment: { id: assignmentId } },
    });

    if (existingSubmission) throw new ForbiddenException("Siz ushbu topshiriqni allaqachon topshirgansiz");

    const submission = this.submissionRepository.create({
      fileUrl: dto.fileUrl,
      comment: dto.comment,
      grade: 0,
      status: SubmissionStatus.PENDING,
      student,
      assignment,
    });

    await this.submissionRepository.save(submission);

    return { message: 'Topshiriq muvaffaqiyatli topshirildi.', submissionId: submission.id };
  }

  async getAllSubmissions() {
    return this.submissionRepository.find({
      relations: ['assignment'], // Faqat assignment bog'lanishini olish
    });
  }
  
  async gradeSubmission(teacherId: number, submissionId: number, dto: GradeSubmissionDto) {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ['assignment'],
    });

    if (!submission) throw new NotFoundException("Topshiriq topilmadi");

    const assignment = submission.assignment;
    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });

    if (!teacher) throw new ForbiddenException("O‘qituvchi topilmadi");

    if (dto.grade < 0 || dto.grade > 100) throw new ConflictException("Baho 0 dan 100 gacha bo‘lishi kerak");

    submission.grade = dto.grade;
    submission.comment = dto.comment;
    submission.status = dto.grade >= 60 ? SubmissionStatus.ACCEPTED : SubmissionStatus.REJECTED;
    
    await this.submissionRepository.save(submission);

    return { message: 'Baho qo‘yildi', submission };
  }

  async getLessonSubmissions(teacherId: number, lessonId: number) {
    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId }, relations: ['group'] });
    if (!lesson) throw new NotFoundException("Dars topilmadi");

    return this.submissionRepository.find({
      where: { assignment: { lesson: { id: lessonId } } },
      relations: ['student', 'assignment'],
    });
  }

  // async getPassedStudents() {
  //   return this.submissionRepository.find({
  //     where: { grade: MoreThan(60), status: SubmissionStatus.ACCEPTED },
  //     relations: ['student', 'assignment'],
  //   });
  // }

  // async getRejectedSubmissions() {
  //   return this.submissionRepository.find({
  //     where: { status: SubmissionStatus.REJECTED },
  //     relations: ['student', 'assignment'],
  //   });
  // }

  // async getPendingSubmissions() {
  //   return this.submissionRepository.find({
  //     where: { status: SubmissionStatus.PENDING },
  //     relations: ['student', 'assignment'],
  //   });
  // }

  // async getAcceptedSubmissions() {
  //   return this.submissionRepository.find({
  //     where: { status: SubmissionStatus.ACCEPTED },
  //     relations: ['student', 'assignment'],
  //   });
  // }

  async getLessonSubmissionsByStatus(teacherId: number, lessonId: number, status: SubmissionStatus) {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['group', 'assignments'],
    });
    if (!lesson) throw new NotFoundException("Dars topilmadi");
  
    const students = await this.studentRepository.find({
      where: { groups: lesson.group },
    });
  
    const submissions = await this.submissionRepository.find({
      where: { assignment: { lesson: { id: lessonId } } },
      relations: ['student', 'assignment'],
    });
  
    if (status === SubmissionStatus.UNSUBMITTED) {
      // Ushbu lesson uchun hech qanday submission qilmagan studentlarni topamiz
      const submittedStudentIds = submissions.map(s => s.student.id);
      return students.filter(student => !submittedStudentIds.includes(student.id));
    }
  
    return submissions.filter(submission => submission.status === status);
  }
  
  
  
  async getDailyGrades(userId: number, groupId: number) {
    const teacher = await this.studentRepository.findOne({ where: { id: userId } });
    if (!teacher) {
      throw new ForbiddenException("Faqat o'qituvchilar kunlik baholarni ko'ra oladi");
    }

    const group = await this.groupRepository.findOne({ where: { id: groupId }, relations: ['students'] });
    if (!group) {
      throw new NotFoundException("Guruh topilmadi");
    }

    const studentIds = group.students.map(student => student.id);

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
      throw new NotFoundException("Guruh topilmadi");
    }

    const studentIds = group.students.map(student => student.id);

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
    const assignment = await this.assignmentRepository.findOne({ where: { id: assignmentId }, relations: ['lesson'] });
    if (!assignment) throw new NotFoundException("Topshiriq topilmadi");

    const lesson = await this.lessonRepository.findOne({ where: { id: assignment.lesson.id }, relations: ['group'] });
    if (!lesson) throw new NotFoundException("Dars topilmadi");

    const group = await this.groupRepository.findOne({ where: { id: lesson.group.id }, relations: ['students'] });
    if (!group) throw new NotFoundException("Guruh topilmadi");

    const allStudents = group.students;
    const submittedStudents = await this.submissionRepository.find({
      where: { assignment: { id: assignmentId } },
      relations: ['student'],
    });

    const submittedStudentIds = submittedStudents.map(s => s.student.id);
    return allStudents.filter(student => !submittedStudentIds.includes(student.id));
  }
}


