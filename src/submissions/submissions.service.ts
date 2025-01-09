import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { User } from '../auth/entities/user.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>, // Assignment repositoryni qo'shish
  ) {}

  async submitAnswer(
    userId: number,
    groupId: number,
    assignmentId: number,
    content: string,
  ) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId, group: { id: groupId } },
    });

    if (!assignment) {
      throw new ForbiddenException('Bu guruh uchun topshiriq mavjud emas.');
    }

    const submission = this.submissionRepository.create({
      content,
      assignment,
      student: { id: userId },
      group: { id: groupId },
    });

    await this.submissionRepository.save(submission);
    return { message: 'Topshiriq muvaffaqiyatli saqlandi.' };
  }


  async gradeSubmission(
    userId: number,
    groupId: number,
    submissionId: number,
    grade: number,
  ) {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId, group: { id: groupId } },
      relations: ['assignment', 'student'],
    });

    if (!submission) {
      throw new NotFoundException('Topshiriq javobi topilmadi.');
    }

    if (submission.assignment.group.id !== groupId) {
      throw new ForbiddenException(
        'Bu guruh uchun topshiriq baholashga ruxsat yo‘q.',
      );
    }

    submission.grade = grade;
    submission.status = true;
    await this.submissionRepository.save(submission);
    return {
      message: 'Topshiriq muvaffaqiyatli baholandi.',
      grade: submission.grade,
    };
  }

  async getDailyGrades(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.teacherId) {
      throw new ForbiddenException(
        "Faqat o'qituvchilargina kundalik baholarni ko'rishi mumkin.",
      );
    }

    return this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .where('submission.createdAt >= CURRENT_DATE')
      .select([
        'student.id AS studentId',
        'SUM(submission.grade) AS totalGrade',
      ])
      .groupBy('student.id')
      .getRawMany();
  }

  async getTotalScores(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.teacherId) {
      throw new ForbiddenException(
        "Faqat o'qituvchilargina umumiy baholarni ko'rishi mumkin",
      );
    }

    return this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .select([
        'student.id AS studentId',
        'SUM(submission.grade) AS totalGrade',
      ])
      .groupBy('student.id')
      .orderBy('totalGrade', 'DESC')
      .getRawMany();
  }
}
