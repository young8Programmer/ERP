import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany, // Import qildik
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { Student } from '../../students/entities/user.entity';
import { Teacher } from '../../teacher/entities/teacher.entity';
import { Lesson } from '../../lesson/entities/lesson.entity'; // import qilish

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ManyToOne(() => Course, (course) => course.groups, { onDelete: 'CASCADE' })
  course: Course;

  @ManyToOne(() => Teacher, (teacher) => teacher.groups, {
    onDelete: 'CASCADE',
  })
  teacher: Teacher;

  @ManyToMany(() => Student, (student) => student.groups)
  @JoinTable()
  students: Student[];

  @OneToMany(() => Lesson, (lesson) => lesson.group)
  lessons: Lesson[];
}
