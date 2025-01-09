import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { User } from '../auth/entities/user.entity';
import { Group } from '../groups/entities/group.entity';
import { Lesson } from 'src/lesson/entities/lesson.entity';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  async submitAnswer(userId: number, assignmentId: number, content: string) {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['student'] });
    if (!user || !user.student) {
      throw new ForbiddenException('Faqat talabalargina topshiriqlarni yuborishi mumkin.');
    }

    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['lesson'],
    });
    if (!assignment) {
      throw new NotFoundException('Topshiriq topilmadi.');
    }

    const lesson = await this.lessonRepository.findOne({
      where: { id: assignment.lesson.id },
      relations: ['group'],
    });
    if (!lesson) {
      throw new NotFoundException('Dars topilmadi.');
    }

    const group = lesson.group;
    const studentGroups = await this.groupRepository.find({
      where: { students: { id: userId } },
    });

    const groupMatch = studentGroups.some(studentGroup => studentGroup.id === group.id);
    if (!groupMatch) {
      throw new ForbiddenException('Faqat o\'zingizning guruhingiz uchun topshiriqlarni yuborishingiz mumkin.');
    }

    const submission = this.submissionRepository.create({
      content,
      assignment,
      student: user.student,
      grade: 0,
      status: false,
    });
    await this.submissionRepository.save(submission);

    return { message: 'Topshiriq muvaffaqiyatli saqlandi.', submissionId: submission.id };
  }

  async gradeSubmission(userId: number, submissionId: number, grade: number) {
    const teacher = await this.userRepository.findOne({ where: { id: userId }, relations: ['teacher'] });
    if (!teacher || !teacher.teacher) {
      throw new ForbiddenException('Faqat o\'qituvchilargina topshiriqlarni baholashi mumkin.');
    }

    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ['assignment', 'assignment.lesson'],
    });
    if (!submission) {
      throw new NotFoundException('Topshiriq javobi topilmadi.');
    }

    const lesson = submission.assignment.lesson;
    const group = await this.groupRepository.findOne({
      where: { id: lesson.group.id },
      relations: ['teacher'],
    });
    if (!group) {
      throw new NotFoundException('Guruh topilmadi.');
    }

    const teacherGroups = await this.groupRepository.find({ where: { teacher: { id: teacher.teacher.id } } });
    const groupMatch = teacherGroups.some(teacherGroup => teacherGroup.id === group.id);
    if (!groupMatch) {
      throw new ForbiddenException('Faqat o\'zingizning guruhingiz uchun topshiriqlarni baholashingiz mumkin.');
    }

    submission.grade = grade;
    submission.status = true;
    await this.submissionRepository.save(submission);

    return { message: 'Topshiriq muvaffaqiyatli baholandi.', grade: submission.grade };
  }

  async getDailyGrades(userId: number) {
    const teacher = await this.userRepository.findOne({ where: { id: userId }, relations: ['teacher'] });
    if (!teacher || !teacher.teacher) {
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
    const teacher = await this.userRepository.findOne({ where: { id: userId }, relations: ['teacher'] });
    if (!teacher || !teacher.teacher) {
      throw new ForbiddenException('Faqat o\'qituvchilargina umumiy baholarni ko\'rishi mumkin.');
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
