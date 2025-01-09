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
    // Userni id bo'yicha topish
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student', 'student.groups'], // Groups ni yuklash
    });
  
    // Agar foydalanuvchi mavjud emas bo'lsa yoki talaba emas bo'lsa
    if (!user || !user.student || !user.student.groups) {
      throw new ForbiddenException('Faqat talabalar topshiriq yuborishi mumkin');
    }
  
    // Assignment ni topish
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['lesson', 'lesson.group'],  // Group va lesson ni yuklash
    });
  
    // Agar assignment mavjud emas bo'lsa yoki lesson yoki group bo'lmasa
    if (!assignment || !assignment.lesson || !assignment.lesson.group) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }
  
    // Talabaning guruhlari mavjudligini tekshirish
    const studentGroupIds = user.student.groups.map((group) => group.id);
  
    // Agar student guruhlari bo'lmasa yoki guruh assignment guruhiga to'g'ri kelmasa
    if (!studentGroupIds.includes(assignment.lesson.group.id)) {
      throw new ForbiddenException(
        'Faqat o‘zingizning guruhingizdagi topshiriqlarga javob bera olasiz',
      );
    }
  
    // Yangi submission yaratish
    const submission = this.submissionRepository.create({
      content,
      assignment,
      student: user,
      grade: 0,
      status: false,
    });
  
    // Submission ni saqlash
    await this.submissionRepository.save(submission);
  
    return {
      message: 'Submission successfully saved',
      submissionId: submission.id,
    };
  }
  
  

  async gradeSubmission(userId: number, submissionId: number, grade: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['group'],
    });

    if (!user || !user.teacherId) {
      throw new ForbiddenException('Faqat o‘qituvchilar baho qo‘ya oladi');
    }

    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ['assignment', 'assignment.group'],
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${submissionId} not found`);
    }

    const teacherGroupIds = user.teacher.groups.map((group) => group.id);

if (!teacherGroupIds.includes(submission.assignment.lesson.group.id)) {
  throw new ForbiddenException(
    'Faqat o‘z guruhingizdagi topshiriqlarga baho qo‘ya olasiz',
  );
}



    submission.grade = grade;
    submission.status = true;

    await this.submissionRepository.save(submission);

    return {
      message: 'Submission successfully graded',
      grade: submission.grade,
    };
  }

  // Talabalarning kunlik baholarini ko'rish
  async getDailyGrades(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.teacherId) {
      throw new ForbiddenException('Faqat o‘qituvchilar bu maʼlumotni ko‘ra oladi');
    }

    const dailyGrades = await this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .where('submission.createdAt >= CURRENT_DATE')
      .select([
        'student.studentId AS studentId',
        'SUM(submission.grade) AS totalGrade',
      ])
      .groupBy('student.studentId')
      .getRawMany();

    return dailyGrades;
  }

  // Talabalarning jami ballarini kamayish tartibida ko'rish
  async getTotalScores(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.teacherId) {
      throw new ForbiddenException('Faqat o‘qituvchilar bu maʼlumotni ko‘ra oladi');
    }

    const totalScores = await this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .select([
        'student.studentId AS studentId',
        'SUM(submission.grade) AS totalGrade',
      ])
      .groupBy('student.studentId')
      .orderBy('totalGrade', 'DESC')
      .getRawMany();

    return totalScores;
  }
}
