import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Lesson } from 'src/lesson/entities/lesson.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'int', nullable: true })
  teacherId: number | null;

  @OneToMany(() => Lesson, (lesson) => lesson.group)
  lessons: Lesson[];
  teacher: any;
  students: any;
  course: any;
}
