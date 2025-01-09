import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { User } from '../auth/entities/user.entity';
import { Group } from '../groups/entities/group.entity';

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
  ) {}

  async submitAnswer(userId: number, assignmentId: number, content: string) {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['student'] });
    if (!user || !user.student) {
      throw new ForbiddenException('Only students can submit assignments');
    }

    const studentGroups = await this.groupRepository.find({ where: { students: { id: userId } } });
    const assignment = await this.assignmentRepository.findOne({ where: { id: assignmentId }, relations: ['lesson', 'lesson.group'] });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const groupMatch = studentGroups.some(group => group.id === assignment.lesson.group.id);
    if (!groupMatch) {
      throw new ForbiddenException('You can only submit assignments for your own group');
    }

    const submission = this.submissionRepository.create({
      content,
      assignment,
      student: user.student,
      grade: 0,
      status: false,
    });
    await this.submissionRepository.save(submission);

    return { message: 'Submission saved successfully', submissionId: submission.id };
  }

  async gradeSubmission(userId: number, submissionId: number, grade: number) {
    const teacher = await this.userRepository.findOne({ where: { id: userId }, relations: ['teacher'] });
    if (!teacher || !teacher.teacher) {
      throw new ForbiddenException('Only teachers can grade submissions');
    }

    const submission = await this.submissionRepository.findOne({ where: { id: submissionId }, relations: ['assignment', 'assignment.lesson', 'assignment.lesson.group'] });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const teacherGroups = await this.groupRepository.find({ where: { teacher: { id: teacher.teacher.id } } });
    const groupMatch = teacherGroups.some(group => group.id === submission.assignment.lesson.group.id);
    if (!groupMatch) {
      throw new ForbiddenException('You can only grade submissions for your own group');
    }

    submission.grade = grade;
    submission.status = true;
    await this.submissionRepository.save(submission);

    return { message: 'Submission graded successfully', grade: submission.grade };
  }

  async getDailyGrades(userId: number) {
    const teacher = await this.userRepository.findOne({ where: { id: userId }, relations: ['teacher'] });
    if (!teacher || !teacher.teacher) {
      throw new ForbiddenException('Only teachers can view daily grades');
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
      throw new ForbiddenException('Only teachers can view total scores');
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
