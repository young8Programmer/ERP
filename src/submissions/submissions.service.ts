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
    // Userni topish
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
  
    if (!user) {
      throw new ForbiddenException('User not found');
    }
  
    // Studentni tekshirish
    const student = await this.userRepository.findOne({
      where: { id: userId },
    });
  
    if (!student) {
      throw new ForbiddenException('Student not found');
    }
  
    // Talaba guruhlarini tekshirish
    const studentGroups = await this.groupRepository.find({
      where: { students: { id: userId } },
    });
  
    if (!studentGroups) {
      throw new ForbiddenException('Talaba guruhiga kiritilmagan yoki guruhlar mavjud emas');
    }
  
    // Assignmentni topish
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
    });
  
    if (!assignment) {
      throw new NotFoundException('Topshiriq topilmadi');
    }
  
    // Courseni olish (Assignmentga asoslanadi)
    const course = await this.assignmentRepository.findOne({
      where: { id: assignment.id },
      relations: ['course'],  // Fetch the course related to the assignment
    });
  
    if (!course) {
      throw new NotFoundException('Course not found');
    }
  
    // Groupni olish (Coursega asoslanadi)
    const group = await this.groupRepository.findOne({
      where: { id: course.lesson.group.id },  // Fetch the group based on course
    });
  
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }
  
    // Guruhni tekshirish
    let groupMatch = false;
    for (const studentGroup of studentGroups) {
      if (studentGroup.id === group.id) {
        groupMatch = true;
        break;
      }
    }
  
    if (!groupMatch) {
      throw new ForbiddenException('Faqat o‘zingizning guruhingizdagi topshiriqlarga javob bera olasiz');
    }
  
    // Submission yaratish va saqlash
    const submission = this.submissionRepository.create({
      content,
      assignment,
      student: student,
      grade: 0,
      status: false,
    });
  
    await this.submissionRepository.save(submission);
  
    return { message: 'Submission successfully saved', submissionId: submission.id };
  }
  
  async gradeSubmission(userId: number, submissionId: number, grade: number) {
    // Userni topish
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
  
    if (!user || !user.teacherId) {
      throw new ForbiddenException('Faqat o‘qituvchilar baho qo‘ya oladi');
    }
  
    // Submissionni topish
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });
  
    if (!submission) {
      throw new NotFoundException(`Submission with ID ${submissionId} not found`);
    }
  
    // Assignmentni topish
    const assignment = await this.assignmentRepository.findOne({
      where: { id: submission.assignment.id },
    });
  
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
  
    // Lessonni topish
    const lesson = await this.assignmentRepository.findOne({
      where: { id: assignment.id },
      relations: ['lesson'],
    });
  
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
  
    // Groupni topish
    const group = await this.groupRepository.findOne({
      where: { id: lesson.lesson.group.id },
    });
  
    if (!group) {
      throw new NotFoundException('Group not found');
    }
  
    // Teacher guruhlarini bitta-bitta olib tekshirish
    const teacher = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['teacher'],
    });
  
    if (!teacher || !teacher.teacher) {
      throw new ForbiddenException('Teacher not found');
    }
  
    // Teacher guruhlarini bitta-bitta olib tekshirish
    const teacherGroups = await this.groupRepository.find({
      where: { teacher: { id: teacher.id } },
    });
  
    if (!teacherGroups || teacherGroups.length === 0) {
      throw new ForbiddenException('Teacher is not assigned to any group');
    }
  
    // Guruhni tekshirish
    let groupMatch = false;
    for (const teacherGroup of teacherGroups) {
      if (teacherGroup.id === group.id) {
        groupMatch = true;
        break;
      }
    }
  
    if (!groupMatch) {
      throw new ForbiddenException('Faqat o‘z guruhingizdagi topshiriqlarga baho qo‘ya olasiz');
    }
  
    // Baho va statusni yangilash
    submission.grade = grade;
    submission.status = true;
  
    await this.submissionRepository.save(submission);
  
    return { message: 'Submission successfully graded', grade: submission.grade };
  }
  
  // Talabalarning kunlik baholarini ko'rish
  async getDailyGrades(userId: number) {
    // Userni topish
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.teacherId) {
      throw new ForbiddenException('Faqat o‘qituvchilar bu maʼlumotni ko‘ra oladi');
    }

    // Kunlik baholarni olish
    const dailyGrades = await this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .where('submission.createdAt >= CURRENT_DATE')
      .select(['student.studentId AS studentId', 'SUM(submission.grade) AS totalGrade'])
      .groupBy('student.studentId')
      .getRawMany();

    return dailyGrades;
  }

  // Talabalarning jami ballarini kamayish tartibida ko'rish
  async getTotalScores(userId: number) {
    // Userni topish
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.teacherId) {
      throw new ForbiddenException('Faqat o‘qituvchilar bu maʼlumotni ko‘ra oladi');
    }

    // Jami ballar
    const totalScores = await this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .select(['student.studentId AS studentId', 'SUM(submission.grade) AS totalGrade'])
      .groupBy('student.studentId')
      .orderBy('totalGrade', 'DESC')
      .getRawMany();

    return totalScores;
  }
}
