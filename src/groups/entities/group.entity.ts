import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { Student } from '../../students/entities/user.entity';
import { Teacher } from '../../teacher/entities/teacher.entity';

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
}
