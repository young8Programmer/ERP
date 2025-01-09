import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Group } from '../groups/entities/group.entity';
import { User } from 'src/auth/entities/user.entity'; // Foydalanuvchi importi

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Guruhga tegishli darslarni olish
  async findLessonsByGroup(groupId: number, userId: number) {
    // Foydalanuvchi malumotlarini olish
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    // Guruhni olish va tekshirish
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['teacher', 'students'], // Guruhning o'qituvchisini va talabalari
    });

    if (!group) throw new NotFoundException('Guruh topilmadi');

    // Foydalanuvchi roli va guruhga tegishliligini tekshirish
    const isTeacher = group.teacher.id === user.teacherId;
    const isStudent = group.students.some(student => student.id === user.studentId); // studentId orqali tekshirish

    if (!isTeacher && !isStudent) {
      throw new ForbiddenException('Siz faqat o\'zingizning guruhingizdagi darslarni ko\'rishingiz mumkin');
    }

    return this.lessonRepository.find({
      where: { group: { id: groupId } },
    });
  }

  // Dars yaratish
  async create(userId: number, lessonData: { title: string; groupId: number }) {
    // Foydalanuvchi malumotlarini olish
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    // Guruhni olish va tekshirish
    const group = await this.groupRepository.findOne({
      where: { id: lessonData.groupId },
      relations: ['teacher'], // Guruhning o'qituvchisini olish
    });

    if (!group) throw new NotFoundException('Guruh topilmadi');

    if (group.teacher.id !== user.teacherId) {
      throw new ForbiddenException('Siz faqat o\'zingizning guruhingizda dars yaratishingiz mumkin');
    }

    // Darsni tekshirish, agar shu nomdagi dars allaqachon bo'lsa
    const existingLesson = await this.lessonRepository.findOne({
      where: { title: lessonData.title, group: { id: lessonData.groupId } },
    });

    if (existingLesson) {
      throw new ForbiddenException('Bu dars allaqachon mavjud');
    }

    const lesson = this.lessonRepository.create({
      title: lessonData.title,
      group,
    });
    return this.lessonRepository.save(lesson);
  }

  // Darsni yangilash
  async update(id: number, updateLessonDto: any, userId: number) {
    // Foydalanuvchi malumotlarini olish
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    const lessonId = Number(id);
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['group'],
    });

    if (!lesson) throw new NotFoundException(`Darslik ID ${id} topilmadi`);

    // Guruhga tegishlilikni tekshirish
    if (lesson.group.teacher.id !== user.teacherId) {
      throw new ForbiddenException('Siz faqat o\'zingizning guruhingizdagi darsni yangilay olasiz');
    }

    const updatedLesson = await this.lessonRepository.save({
      ...lesson,
      ...updateLessonDto,
    });
    return updatedLesson;
  }

  // Darsni o'chirish
  async remove(id: string, userId: number) {
    // Foydalanuvchi malumotlarini olish
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    const lessonId = Number(id);
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['group'],
    });

    if (!lesson) throw new NotFoundException(`Darslik ID ${id} topilmadi`);

    // Guruhga tegishlilikni tekshirish
    if (lesson.group.teacher.id !== user.teacherId) {
      throw new ForbiddenException('Siz faqat o\'zingizning guruhingizdagi darsni o\'chirishingiz mumkin');
    }

    await this.lessonRepository.delete(lessonId);
    return { message: `Darslik ID ${id} muvaffaqiyatli o'chirildi` };
  }
}
