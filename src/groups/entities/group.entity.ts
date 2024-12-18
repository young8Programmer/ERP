import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { Student } from '../../students/entities/user.entity';
import { Teacher } from '../../teacher/entities/teacher.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ManyToOne(() => Course, (course) => course.groups)
  course: Course; // Bitta kurs

  @ManyToOne(() => Teacher, (teacher) => teacher.groups)
  teacher: Teacher; // Bitta o'qituvchi

  @ManyToMany(() => Student, (student) => student.groups)
  @JoinTable()
  students: Student[]; // Bir nechta talabalar
}
