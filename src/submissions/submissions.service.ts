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

  async submitAnswer(userId: number, content: string, assignmentId: any) {
  const user: any = await this.userRepository.findOne({ where: { id: userId } });
  const assignment = await this.assignmentRepository.findOne({where: {id: assignmentId}, relations: ["lesson"]})

  if (!assignment) {
    throw new ForbiddenException("Bunday topshiriq mavjud emas")
  }

  const lesson = await this.lessonRepository.findOne({where: {id: assignment.lesson.id}, relations: ["group"]})

  if (!lesson) {
    throw new ForbiddenException("Bunday topshiriqni darsligi mavjud emas")
  }

  const group = await this.groupRepository.findOne({where: {id: lesson.group.id}, relations: ["students"]})

  if (!group) {
    throw new ForbiddenException("Bunday topshiriqni darsligini guruhi mavjud emas")
  }

  if (!group.students.map((student) => student.id).includes(user.studentId)) {
    throw new ForbiddenException("siz bu topshiriq guruh talabasi emassiz")
  }

  const existingSubmission = await this.submissionRepository.findOne({
    where: { 
      student: { id: user.studentId }, 
      assignment: { id: assignmentId }
    },
    relations: ["student", "assignment"],
  });
  
  if (existingSubmission) {
    throw new ForbiddenException("Siz bu topshiriqni allaqachon bajargansiz");
  }
  
  const submission = this.submissionRepository.create({
    content,
    grade: 0,
    status: false,
    student: user.studentId,
    assignment: assignmentId
  });

  await this.submissionRepository.save(submission);

    return { message: 'Topshiriq muvaffaqiyatli saqlandi.', submissionId: submission.id };
  }
    
    async getAllSubmissions(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new ForbiddenException("Siz ro'yxatdan o'tmagansiz");
    }
    const submissions = await this.submissionRepository.find({
      relations: [
        'student',
        'assignment',
        'assignment.lesson',
        'assignment.lesson.group',
        'assignment.lesson.group.teacher',
      ],
    });
      
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

  async getDailyGrades(userId: number, groupId: number) {
    // O'qituvchi rolini tekshirish
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.teacherId) {
      throw new ForbiddenException("Faqat o'qituvchilargina kundalik baholarni ko'rishi mumkin.");
    }
  
    // Guruhni topish
    const group = await this.groupRepository.findOne({ where: { id: groupId }, relations: ['students'] });
    if (!group) {
      throw new NotFoundException("Bunday guruh topilmadi.");
    }
  
    // Talabalar ro'yxatini olish
    const studentIds = group.students.map(student => student.id);
  
    // Baholarni olish va guruhlash
    return this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .where('submission.submittedAt >= CURRENT_DATE')  // Bugungi kunga teng yoki undan keyingi baholar
      .andWhere('student.id IN (:...studentIds)', { studentIds })  // Talabalar bo'yicha filtr
      .andWhere('submission.grade IS NOT NULL')  // Bahosi bo'lgan submissions
      .select([
        'student.id AS studentId',  // Talaba IDsi
        'student.firstName AS firstName', // Talabaning ismi
        'student.lastName AS lastName',   // Talabaning familiyasi
        'submission.submittedAt AS submittedAt',  // Submission vaqti
        'SUM(submission.grade) AS totalGrade',  // Jami baho
      ])
      .groupBy('student.id')  // Talaba bo'yicha guruhlash
      .addGroupBy('student.firstName')  // Ism bo'yicha guruhlash
      .addGroupBy('student.lastName')   // Familiya bo'yicha guruhlash
      .having('SUM(submission.grade) > 0')  // Jami baho musbat bo'lishi kerak
      .orderBy('submission.submittedAt', 'ASC')  // Submission vaqtiga qarab saralash
      .getRawMany();  // So'rovni bajarish va natijalarni olish
  }
  
  async getTotalScores(userId: number, groupId: number) {
    // O'qituvchi rolini tekshirish
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.teacherId) {
      throw new ForbiddenException("Faqat o'qituvchilargina jami baholarni ko'rishi mumkin");
    }
  
    // Guruhni topish
    const group = await this.groupRepository.findOne({ where: { id: groupId }, relations: ['students'] });
    if (!group) {
      throw new NotFoundException("Bunday guruh topilmadi.");
    }
  
    // Talabalar ro'yxatini olish
    const studentIds = group.students.map(student => student.id);
  
    // Baholarni olish va jami baholarni hisoblash
    return this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .where('student.id IN (:...studentIds)', { studentIds })  // Talabalar bo'yicha filtr
      .select([
        'student.id AS studentId',  // Talaba IDsi
        'student.firstName AS firstName', // Talabaning ismi
        'student.lastName AS lastName',   // Talabaning familiyasi
        'SUM(submission.grade) AS totalGrade',  // Jami baho
      ])
      .groupBy('student.id')  // Talaba bo'yicha guruhlash
      .addGroupBy('student.firstName')  // Ism bo'yicha guruhlash
      .addGroupBy('student.lastName')   // Familiya bo'yicha guruhlash
      .orderBy('totalGrade', 'DESC')  // Jami baho bo'yicha kamayish tartibida saralash
      .getRawMany();  // So'rovni bajarish va natijalarni olish
  }
  
}  