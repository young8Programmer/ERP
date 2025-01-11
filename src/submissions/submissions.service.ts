import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async submitAnswer(userId: number, content: string) {
  const user: any = await this.userRepository.findOne({ where: { id: userId } });
  
  if (!user?.studentId) {
    throw new ForbiddenException('Faqat talabalargina topshiriqlarni yuborishi mumkin.');
  }

  const existingSubmission: any = await this.submissionRepository.findOne({ where: { content }, relations: ["student"]});
  if (existingSubmission && existingSubmission.student.id == user.studentId) {
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

  async gradeSubmission(userId: number, submissionId: number, grade: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.teacherId) {
      throw new ForbiddenException('Faqat o\'qituvchilargina topshiriqlarni baholashi mumkin.');
    }

    const submission = await this.submissionRepository.findOne({ where: { id: submissionId } });
    if (!submission) {
      throw new NotFoundException('Topshiriq javobi topilmadi.');
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
