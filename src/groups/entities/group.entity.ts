import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Lesson } from 'src/lesson/entities/lesson.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true }) // teacherId NULL bo'lishi mumkin emas
  teacherId: number;

  @OneToMany(() => Lesson, (lesson) => lesson.group)
  lessons: Lesson[];
  teacher: any;
  students: any;
  course: any;
}
