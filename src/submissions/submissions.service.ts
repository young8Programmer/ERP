import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { User } from '../auth/entities/user.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Lesson } from 'src/lesson/entities/lesson.entity';
import { Student } from 'src/students/entities/user.entity';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  async submitAnswer(userId: number, content: string, assignmentId: number) {
  const user: any = await this.userRepository.findOne({ where: { id: userId } });
  const assignment = await this.assignmentRepository.findOne({where: {id: assignmentId}, relations: ["lesson"]})

  if (!assignment) {
    throw new ForbiddenException("Bunday topshiriq mavjud emas")
  }

  const lesson = await this.lessonRepository.findOne({where: {id: assignment.lesson.id}, relations: ["group"]})

  if (!lesson) {
    throw new ForbiddenException("Bunday topshiriqni darsligi mavjud emas")
  }

  const group = await this.groupRepository.findOne({where: {id: lesson.group.id}, relations: ["group"]})

  if (!group) {
    throw new ForbiddenException("Bunday topshiriqni darsligini guruhi mavjud emas")
  }

  if (!group.students.map((student) => student.id).includes(user.studentId)) {
    throw new ForbiddenException("siz bu topshiriq guruh talabasi emassiz")
  }

  const existingSubmission: any = await this.submissionRepository.findOne({ where: { student: {id: user.studentId} }, relations: ["student"]}); 
  if (existingSubmission) {
    throw new ForbiddenException("Siz bu topshiriqni bajargansiz")
  }

  const submission = this.submissionRepository.create({
    content,
    grade: 0,
    status: false,
    student: user.studentId
  });

  await this.submissionRepository.save(submission);

  return { message: 'Topshiriq muvaffaqiyatli saqlandi.', submissionId: submission.id };
}
async getAllSubmissions(userId: number) {
  const user = await this.userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new ForbiddenException("Siz ro'yxatdan o'tmagansiz");
  }

  const submissions = await this.submissionRepository.createQueryBuilder('submission')
  .leftJoinAndSelect('submission.student', 'student')
  .leftJoinAndSelect('submission.assignment', 'assignment')
  .leftJoinAndSelect('assignment.lesson', 'lesson')
  .leftJoinAndSelect('lesson.group', 'group')
  .leftJoinAndSelect('group.teacher', 'teacher')
  .select([
    'submission.id',
    'submission.content',
    'submission.status',
    'submission.grade',
    'submission.submittedAt',
    'student.id', 'student.firstName', 'student.lastName', 'student.phone', 'student.address', 'student.role',
    'assignment.id', 'assignment.assignment',
    'lesson.id', 'lesson.title',
    'group.id', 'group.name',
    'teacher.id', 'teacher.firstName', 'teacher.lastName'
  ])
  .getMany();

return submissions;

}


  async gradeSubmission(userId: number, submissionId: number, grade: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    const submission = await this.submissionRepository.findOne({ where: { id: submissionId }, relations: ["assignment"]});
    if (!submission) {
      throw new NotFoundException('Topshiriq javobi topilmadi.');
    }

    if (submission.status) {
      throw new NotFoundException("Bu topshiriqqa baxo qo'ygansiz");
    }

    const assignment = await this.assignmentRepository.findOne({ where: { id: submission.assignment.id }, relations: ["lesson"]});

    if (!assignment) {
      throw new NotFoundException("bu javobni topshirig'i mavjud emas");
    }

    const lesson = await this.lessonRepository.findOne({ where: { id: assignment.lesson.id }, relations: ["group"]});

    if (!lesson) {
      throw new NotFoundException("bu javobni topshirig'ini darsligi mavjud emas");
    }

    
    const group = await this.groupRepository.findOne({ where: { id: lesson.group.id }, relations: ["teacher"]});

    if (group.teacher.id !== user.teacherId) {
      throw new NotFoundException("siz bu guruhni topshirig'iga baxo qo'ya olmaysiz");
    }

    submission.grade = grade;
    submission.status = true;
    await this.submissionRepository.save(submission);

    return { message: 'Topshiriq muvaffaqiyatli baholandi.', grade: submission.grade };
  }

  async getDailyGrades(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.teacherId) {
      throw new ForbiddenException('Faqat o\'qituvchilargina kundalik baholarni ko\'rishi mumkin.');
    }

    return this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .where('submission.createdAt >= CURRENT_DATE')
      .select(['student.id AS studentId', 'SUM(submission.grade) AS totalGrade'])
      .groupBy('student.id')
      .getRawMany(); 
    }

  async getTotalScores(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.teacherId) {
      throw new ForbiddenException("Faqat o'qituvchilargina umumiy baholarni ko'rishi mumkin");
    }

    return this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .select(['student.id AS studentId', 'SUM(submission.grade) AS totalGrade'])
      .groupBy('student.id')
      .orderBy('totalGrade', 'DESC')
      .getRawMany();
  }
}
