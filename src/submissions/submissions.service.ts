import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { Student } from 'src/students/entities/student.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Lesson } from 'src/lesson/entities/lesson.entity';
import { Teacher } from 'src/teacher/entities/teacher.entity';

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
    private readonly teacherRepository: Repository<Teacher>
  ) {}

  async submitAnswer(userId: number, content: string, assignmentId: any) {
    const student = await this.studentRepository.findOne({ where: { id: userId } });
    if (!student) {
      throw new ForbiddenException("Talaba topilmadi");
    }

    const assignment = await this.assignmentRepository.findOne({where: {id: assignmentId}, relations: ["lesson"]});
    if (!assignment) {
      throw new ForbiddenException("Topshiriq topilmadi");
    }

    const lesson = await this.lessonRepository.findOne({where: {id: assignment.lesson.id}, relations: ["group"]});
    if (!lesson) {
      throw new ForbiddenException("Dars topilmadi");
    }

    const group = await this.groupRepository.findOne({where: {id: lesson.group.id}, relations: ["students"]});
    if (!group) {
      throw new ForbiddenException("Guruh topilmadi");
    }

    if (!group.students.map((student) => student.id).includes(userId)) {
      throw new ForbiddenException("Siz ushbu topshiriq uchun guruhda emassiz");
    }

    const existingSubmission = await this.submissionRepository.findOne({
      where: { student: { id: userId }, assignment: { id: assignmentId } },
      relations: ["student", "assignment"],
    });

    if (existingSubmission) {
      throw new ForbiddenException("Siz ushbu topshiriqni allaqachon topshirgansiz");
    }

    const submission = this.submissionRepository.create({
      content,
      grade: 0,
      status: false,
      student,
      assignment,
    });

    await this.submissionRepository.save(submission);

    return { message: 'Topshiriq muvaffaqiyatli topshirildi.', submissionId: submission.id };
  }

  async getAllSubmissions(userId: number) {
    const teacher = await this.teacherRepository.findOne({ where: { id: userId } });
  
    if (!teacher) {
      throw new ForbiddenException("Faqat ustozlar topshiriqlarni ko'rishlari mumkin");
    }
  
    const submissions = await this.submissionRepository.find({
      relations: [
        'student', 
        'assignment', 
        'assignment.lesson', 
        'assignment.lesson.group'
      ],
    });
  
    if (!submissions.length) {
      throw new NotFoundException("Hali hech qanday topshiriq yuborilmagan");
    }
  
    return submissions;
  }
  

  async gradeSubmission(userId: number, submissionId: number, grade: number) {
    const teacher = await this.studentRepository.findOne({ where: { id: userId} });
    if (!teacher) {
      throw new ForbiddenException("Faqat o'qituvchilar topshiriqlarni baholay oladi");
    }

    const submission = await this.submissionRepository.findOne({ where: { id: submissionId }, relations: ['assignment'] });
    if (!submission) {
      throw new NotFoundException('Topshiriq topshirmasi topilmadi');
    }

    if (submission.status) {
      throw new ForbiddenException('Bu topshiriq allaqachon baholangan');
    }

    submission.grade = grade;
    submission.status = true;

    await this.submissionRepository.save(submission);

    return { message: 'Topshiriq muvaffaqiyatli baholandi.', grade: submission.grade };
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
}
