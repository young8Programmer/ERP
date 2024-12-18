import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { Student } from '../../students/entities/user.entity';
import { Teacher } from '../../teacher/entities/teacher.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ManyToMany(() => Course, (course) => course.groups)
  courses: Course[];

  @ManyToMany(() => Student, (student) => student.groups)
  @JoinTable()
  students: Student[];

  @ManyToMany(() => Teacher, (teacher) => teacher.groups)
  @JoinTable()
  teachers: Teacher[];
}
